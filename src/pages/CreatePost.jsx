import { useState } from "react";
import { usePosts } from "../context/PostContext";

export default function CreatePost({ onCreated }) {
  const { createPost } = usePosts();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skillToLearn, setSkillToLearn] = useState("");
  const [skillToTeach, setSkillToTeach] = useState("");
  const [exchangeCredits, setExchangeCredits] = useState(1);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const newPost = await createPost({
        title,
        description,
        skillToLearn,
        skillToTeach,
        exchangeCredits,
      });
      onCreated?.(newPost); // optional callback to parent
      setTitle("");
      setDescription("");
      setSkillToLearn("");
      setSkillToTeach("");
      setExchangeCredits(1);
    } catch (err) {
      setError(err.message || "Error creating post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        padding: "20px",
        border: "1px solid #ccc",
        borderRadius: "10px",
      }}
    >
      <h2>Create a New Post</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <input
        type="text"
        placeholder="Skill to Learn"
        value={skillToLearn}
        onChange={(e) => setSkillToLearn(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Skill to Teach"
        value={skillToTeach}
        onChange={(e) => setSkillToTeach(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Exchange Credits"
        value={exchangeCredits}
        min={1}
        max={9999}
        onChange={(e) => setExchangeCredits(Number(e.target.value))}
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? "Creating..." : "Create Post"}
      </button>
    </form>
  );
}
