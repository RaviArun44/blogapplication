import { Modal } from "@mui/material";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { updatePost } from "../../api";

export const UpdateModal = ({ open, onClose, post }) => {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [content, setContent] = useState("");
  const userId = parseInt(localStorage.getItem("id") || "0", 10);

  useEffect(() => {
    if (post) {
      setTitle(post.title || "");
      setExcerpt(post.excerpt || "");
      setCategory(post.category || "");
      setCoverImage(post.coverImage || "");
      setContent(post.content || "");
    }
  }, [post]);

  const categories = [
    "Technology",
    "Design",
    "Business",
    "LifeStyle",
    "Health",
  ];

  const _updatePost = async () => {
    if (
      title.trim() !== "" &&
      excerpt.trim() !== "" &&
      category.trim() !== "" &&
      coverImage.trim() !== "" &&
      content.trim() !== ""
    ) {
      const updatedData = {
        title,
        excerpt,
        category,
        coverImage,
        content,
      };

      try {
        const updatedPost = await updatePost(post.id, userId, updatedData);
        toast.success("Post updated successfully");
        onClose();
        await window.location.reload();
      } catch (error) {
        console.error("Error updating post:", error);
        toast.error("Failed to update post");
      }
    } else {
      toast.warn("Please enter all required fields");
    }
  };
  return (
    <Modal open={open} onClose={onClose}>
      <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 bg-opacity-30 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4 mx-2">
          <h2 className="text-2xl font-semibold text-gray-800">Update Post</h2>

          <div className="space-y-2">
            <label className="block text-sm text-gray-700">Title</label>
            <input
              type="text"
              value={title}
              placeholder="Title"
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-700">Excerpt</label>
            <textarea
              rows={2}
              value={excerpt}
              placeholder="Sub-Title"
              onChange={(e) => setExcerpt(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border rounded-md bg-white text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-700">
              Cover Image URL
            </label>
            <input
              type="text"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm text-gray-700">Content</label>
            <textarea
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-800"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-black rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={() => {
                _updatePost();
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
