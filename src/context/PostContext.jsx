import { useState, createContext, useContext, useMemo, useCallback } from "react";
import { Post as PostAPI } from "../api";

const PostContext = createContext(null);

export default function PostProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get all posts
  const getAllPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const postRes = await PostAPI.getAllPosts(); // returns array
      setPosts(postRes || []);
      return postRes;
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching posts");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a single post
  const getSinglePost = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const post = await PostAPI.singlePost(id);
      setCurrentPost(post);
      return post;
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching post");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get author of a post
  const getAuthorFromPost = useCallback(async (id) => {
    try {
      return await PostAPI.authorOfThePost(id);
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching author");
      throw err;
    }
  }, []);

  // Get comments of a post
  const getCommentsByPost = useCallback(async (id) => {
    try {
      const comments = await PostAPI.commentsOfThePost(id);
      return comments || [];
    } catch (err) {
      setError(err.response?.data?.message || "Error fetching comments");
      throw err;
    }
  }, []);

  // Create a post
  const createPost = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      // ensure comments initialized
      const postData = { ...data, comments: [] };
      const newPost = await PostAPI.createPost(postData);
      setPosts((prev) => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      setError(err.response?.data?.message || "Error creating post");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update a post
  const updatePost = useCallback(
    async (id, data) => {
      setLoading(true);
      setError(null);
      try {
        const updatedPost = await PostAPI.updatePost(id, data);
        setPosts((prev) =>
          prev.map((post) => (post._id === id ? updatedPost : post))
        );
        if (currentPost?._id === id) setCurrentPost(updatedPost);
        return updatedPost;
      } catch (err) {
        setError(err.response?.data?.message || "Error updating post");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentPost]
  );

  // Delete a post
  const deletePost = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);
      try {
        await PostAPI.deletePost(id);
        setPosts((prev) => prev.filter((post) => post._id !== id));
        if (currentPost?._id === id) setCurrentPost(null);
        return true;
      } catch (err) {
        setError(err.response?.data?.message || "Error deleting post");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentPost]
  );

  const value = useMemo(
    () => ({
      posts,
      currentPost,
      loading,
      error,
      getAllPosts,
      getSinglePost,
      getAuthorFromPost,
      getCommentsByPost,
      createPost,
      updatePost,
      deletePost,
    }),
    [
      posts,
      currentPost,
      loading,
      error,
      getAllPosts,
      getSinglePost,
      getAuthorFromPost,
      getCommentsByPost,
      createPost,
      updatePost,
      deletePost,
    ]
  );

  return <PostContext.Provider value={value}>{children}</PostContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePosts() {
  const ctx = useContext(PostContext);
  if (ctx === null) throw new Error("usePosts must be used within <PostProvider>.");
  return ctx;
}
