// src/pages/PostDetails.jsx
import { useEffect, useState } from "react";
import { usePosts } from "../context/PostContext";
import { useParams } from "react-router-dom";

export default function PostDetails() {
  const { postId } = useParams();
  const { getSinglePost, getCommentsByPost } = usePosts();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!postId) {
      setError("No postId in URL");
      setLoading(false);
      return;
    }

    async function fetchPost() {
      setLoading(true);
      setError(null);
      try {
        // Fetch the post
        const postData = await getSinglePost(postId);
        if (!postData) throw new Error("Post not found");
        setPost(postData);

        // Fetch comments (safe fallback to empty array)
        const postComments = await getCommentsByPost(postId);
        setComments(Array.isArray(postComments) ? postComments : []);
      } catch (err) {
        setError(err.message || "Error loading post");
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [postId, getSinglePost, getCommentsByPost]);

  if (loading) return <p>Loading post...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!post) return <p>Post not found</p>;

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "20px auto",
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "10px",
      }}
    >
      <h2>{post.title}</h2>
      <p>
        <strong>Author:</strong> {post.author?.username || "Unknown"}
      </p>
      <p>{post.description || "No description provided."}</p>

      <p>
        <strong>Skill To Learn:</strong> {post.skillToLearn?.name || "-"}
      </p>
      <p>
        <strong>Skill To Teach:</strong> {post.skillToTeach?.name || "-"}
      </p>
      <p>
        <strong>Exchange Credits:</strong> {post.exchangeCredits ?? 0}
      </p>
      <p>
        <strong>Status:</strong> {post.status || "active"}
      </p>
      <p>
        <strong>Location:</strong> {post.location || "-"}
      </p>

      <h3>Comments ({comments.length})</h3>
      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        <ul>
          {comments.map((c) => (
            <li key={c._id} style={{ marginBottom: "10px" }}>
              <strong>{c.author?.username || "Unknown"}:</strong>{" "}
              {c.comment || "-"}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
