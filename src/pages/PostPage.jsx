import { useEffect } from "react";
import { usePosts } from "../context/PostContext";
import { useNavigate, Link } from "react-router-dom";
import CreatePost from "./CreatePost";

export default function PostPage() {
  const { posts, loading, error, getAllPosts } = usePosts();
  const navigate = useNavigate();

  useEffect(() => {
    getAllPosts();
  }, [getAllPosts]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>All Posts</h1>
      <button
          onClick={() => navigate("/posts/create")}
          style={{
            padding: "10px 20px",
            cursor: "pointer",
            backgroundColor: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Create a New Post
        </button>

      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        {posts.map((post) => (
          <div
            key={post._id}
            onClick={() => navigate(`/posts/${post._id}`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
              padding: "15px",
              border: "1px solid #ccc",
              borderRadius: "10px",
              cursor: "pointer",
              boxShadow: "2px 2px 6px rgba(0,0,0,0.1)",
              transition: "transform 0.1s, box-shadow 0.1s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow = "4px 4px 12px rgba(0,0,0,0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "2px 2px 6px rgba(0,0,0,0.1)";
            }}
          >
            <img
              src={post.author?.profilePhoto || ""}
              alt={post.author?.username || "Unknown"}
              style={{ width: "60px", height: "60px", borderRadius: "50%" }}
            />
            <div>
              <h2 style={{ margin: "0 0 5px 0" }}>{post.title}</h2>
              <p style={{ margin: "0 0 3px 0" }}>
                <strong>Author:</strong> {post.author?.username || "Unknown"}
              </p>
              <p style={{ margin: "0 0 3px 0" }}>
                <strong>Skill To Learn:</strong>{" "}
                {post.skillToLearn?.name || "-"}
              </p>
              <p style={{ margin: "0 0 3px 0" }}>
                <strong>Skill To Teach:</strong>{" "}
                {post.skillToTeach?.name || "-"}
              </p>
              <p style={{ margin: "0 0 3px 0" }}>
                <strong>Exchange Credits:</strong> {post.exchangeCredits || 0}
              </p>
              <p style={{ margin: 0 }}>
                <strong>Status:</strong> {post.status || "active"}
              </p>
              <p style={{ margin: "5px 0 0 0" }}>
                <strong>Comments:</strong> {(post.comments || []).length}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
