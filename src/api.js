// src/api.js
import axios from "axios";

/* ================================
   Axios instances
   ================================ */
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // e.g. http://localhost:8080/api
  withCredentials: true,                 // send/receive httpOnly cookies
});

// a bare client to call /auth/refresh without our interceptor recursion
const refreshApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

/* ================================
   Refresh queue (prevents storms)
   ================================ */
let isRefreshing = false;
let refreshPromise = null;
let onUnauthenticated = null;

export function setOnUnauthenticated(fn) {
  onUnauthenticated = fn;
}

async function runRefresh() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        // IMPORTANT: use refreshApi (no interceptors) to avoid recursion
        await refreshApi.get("/auth/refresh");
        return true;
      } catch {
        return false;
      } finally {
        isRefreshing = false;
        // allow a new refresh next time
        setTimeout(() => (refreshPromise = null), 0);
      }
    })();
  }
  return refreshPromise;
}

/* ================================
   401 handling interceptor
   ================================ */
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config || {};
    const status = error?.response?.status;

    // If no response (network/CORS) or not 401 => bubble up
    if (!status || status !== 401) {
      return Promise.reject(error);
    }

    // Never try to refresh if the failing call WAS the refresh endpoint
    const url = (original?.url || "").toString();
    if (url.includes("/auth/refresh")) {
      if (onUnauthenticated) onUnauthenticated();
      return Promise.reject(error);
    }

    // Prevent infinite loops
    if (original._retry) {
      if (onUnauthenticated) onUnauthenticated();
      return Promise.reject(error);
    }
    original._retry = true;

    try {
      // only one refresh at a time; others await it
      if (!isRefreshing) isRefreshing = true;
      const ok = await runRefresh();

      if (!ok) {
        if (onUnauthenticated) onUnauthenticated();
        return Promise.reject(error);
      }

      // refresh ok: retry original request
      // axios keeps method/data/headers in original config
      return api(original);
    } catch (error) {
      if (onUnauthenticated) onUnauthenticated();
      return Promise.reject(error);
    }
  }
);

/* ================================
   Thin wrappers (always return .data)
   ================================ */
async function get(url, params) {
  const res = await api.get(url, { params }); // pass params correctly
  return res.data;
}
async function post(url, data) {
  const res = await api.post(url, data);
  return res.data;
}
async function put(url, data) {
  const res = await api.put(url, data);
  return res.data;
}
async function patch(url, data) {
  const res = await api.patch(url, data);
  return res.data;
}
async function del(url) {
  const res = await api.delete(url);
  return res.data;
}

/* ================================
   API groups (only what exists)
   ================================ */
export const Auth = {
  async register(payload) { return post("/auth/register", payload); },
  async login(payload)    { return post("/auth/login", payload); },
  async logout()          { return post("/auth/logout"); },

  // If your backend expects POST for refresh, switch to refreshApi.post(...) here
  async refresh()         { 
    const res = await refreshApi.get("/auth/refresh");
    return res.data;
  },

  async me()              { return get("/me"); },

  async updateProfile(data)  { return patch("/me", data); },
  async changePassword(data) { return post("/me/change-password", data); },

  async addTeach(payload) { return post("/me/teach", payload); },
  async removeTeach(id)   { return del(`/me/teach/${id}`); },

  async addLearn(payload) { return post("/me/learn", payload); },
  async removeLearn(id)   { return del(`/me/learn/${id}`); },
};

export const Catalog = {
  async categories(params)            { return get("/categories", params); },
  async categorySkills(idOrSlug, params)   { return get(`/categories/${idOrSlug}/skills`, params); },
  async skills(params)                { return get("/skills", params); },
  async skill(idOrSlug)               { return get(`/skills/${idOrSlug}`); },
  async peopleOffer(idOrSlug, params) { return get(`/skills/${idOrSlug}/people/offer`, params); },
  async peopleWant(idOrSlug, params)  { return get(`/skills/${idOrSlug}/people/want`, params); },
};

/* Optional: posts/comments only if your backend supports them */
export const Post = {
  async createPost(data)      { return post("/posts", data); },
  async getAllPosts()          { return get("/posts"); },
  async singlePost(id)        { return get(`/posts/${id}`); },
  async authorOfThePost(id)   { return get(`/posts/author/${id}`); },
  async updatePost(id, data)  { return put(`/posts/${id}`, data); },
  async deletePost(id)        { return del(`/posts/${id}`); },
  async commentsOfThePost(id) { return get(`/comments/posts/${id}`); },
};

export const Comments = {
  async createComment(data)      { return post(`/comments/create`, data); },
  async updateComment(id, data)  { return put(`/comments/update/${id}`, data); },
  async deleteComment(id)        { return del(`/comments/delete/${id}`); },
};
