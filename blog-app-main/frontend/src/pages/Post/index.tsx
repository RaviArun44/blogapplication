import { useState, useEffect } from "react";
import { format } from "date-fns";
import { MessageCircle, Send, Clock, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { Footer, Navbar } from "../../components";
import commentUser from "../../assets/comment-user.jpg";
import {
  getCommentsByPostId,
  addComment,
  getLikesByPostId,
} from "../../api/index";
import { toggleLike } from "../../api/likesApi";
import { HeartAnimation } from "../Home/heartAnimation";
import user from "../../assets/profile.png";
import LikeButton from "../../components/likes";
import { toast } from "react-toastify";

export const PostPage = () => {
  if (
    localStorage.getItem("id") === null ||
    localStorage.getItem("username") === null
  ) {
    toast.warn("Log in to access");
    window.location.href = "/";
  }
  const [isLoading, setIsLoading] = useState(false);
  const [likerIds, setLikerIds] = useState<number[]>([]);
  const [showHeart, setShowHeart] = useState(false);
  const [showFirstHeart, setShowFirstHeart] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState("");

  const location = useLocation();
  const navigate = useNavigate();
  const { post } = location.state || { post: null };

  const userId = parseInt(localStorage.getItem("id") || "0", 10);
  const localUserName = localStorage.getItem("username");

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!post) {
      navigate("/");
      return;
    }

    const fetchLikes = async () => {
      try {
        const likers = await getLikesByPostId(post.id);
        setLikerIds(likers || []);
      } catch (error) {
        console.error("Error fetching likes:", error);
        setLikerIds([]);
      }
    };

    const fetchInitialComments = async () => {
      try {
        const fetchedComments = await getCommentsByPostId(post.id, 1);
        if (Array.isArray(fetchedComments)) {
          const processedComments = fetchedComments.map((comment) => ({
            id: comment.id,
            userId: comment.userId,
            userName: comment.author || "Unknown User",
            content: comment.message || comment.content || "",
            timestamp: comment.createdAt || new Date(),
            likes: comment.likes || 0,
          }));
          setComments(processedComments);
        } else {
          console.error("Unexpected data format:", fetchedComments);
          setComments([]);
        }
      } catch (err) {
        console.error("Failed to fetch comments", err);
        setError("Could not load comments.");
      } finally {
      }
    };

    fetchLikes();
    fetchInitialComments();
  }, [post, navigate]);

  useEffect(() => {
    const fetchLikes = async () => {
      const likers = await getLikesByPostId(post.id);
      setLikerIds(likers);
    };
    fetchLikes();
  }, [post.id]);

  const handleToggleLike = async () => {
    const hasLiked = likerIds.includes(userId);
    try {
      if (hasLiked) {
        setLikerIds((prev) => prev.filter((id) => id !== userId));
      } else {
        setLikerIds((prev) => [...prev, userId]);
      }
      await toggleLike(post.id, userId);
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleDoubleClick = async () => {
    if (!userId) return;
    if (!showFirstHeart) {
      const hasLiked = likerIds.includes(userId);
      if (!hasLiked) {
        setLikerIds((prev) => [...prev, userId]);
        try {
          await toggleLike(post.id, userId);
        } catch (error) {
          console.error("Error toggling like:", error);
          setLikerIds((prev) => prev.filter((id) => id !== userId)); // rollback
        }
      }
      setShowFirstHeart(true); // only once
    }
    setShowHeart(true);
    setTimeout(() => {
      setShowHeart(false);
    }, 1000);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !userId) return;

    setIsLoading(true);

    try {
      const response = await addComment(post.id, userId, newComment);

      const newCommentObj = {
        id: response?.id || Date.now(),
        userId: userId,
        userName: localUserName || "Anonymous",
        content: newComment,
        timestamp: new Date(),
        likes: 0,
      };

      setComments((prev) => [newCommentObj, ...prev]);
      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment", err);
      setError("Failed to post comment. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="mb-16">
        <Navbar />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => navigate("/home")}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors group"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-medium relative">
              Back to Home
              <span className="absolute left-0 bottom-[-2px] h-[2px] w-0 bg-blue-600 transition-all duration-300 group-hover:w-full" />
            </span>
          </button>
        </div>

        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl mb-10"
        >
          {post.coverImage && (
            <div
              className="relative h-64 sm:h-96 overflow-hidden"
              onDoubleClick={handleDoubleClick}
            >
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>

              {/* Category Badge */}
              <div className="absolute bottom-6 left-6 z-10">
                <span className="bg-blue-600 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider text-white">
                  {post.category}
                </span>
              </div>

              {<HeartAnimation showHeart={showHeart} />}
            </div>
          )}

          <div className="p-6 sm:p-10">
            {/* Post Metadata */}
            <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
              <div className="flex items-center gap-3">
                <span>
                  {format(new Date(post.createdAt), "MMM d, yyyy • h:mm a")}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={16} />5 min read
                </span>
              </div>
            </div>

            {/* Author Info */}
            <div className="flex items-center space-x-4 mb-8 border-b border-gray-100 pb-6">
              <img
                src={user}
                alt={post.username}
                className="w-12 h-12 rounded-full border-2 border-blue-500 shadow-md"
              />
              <div>
                <p className="font-semibold text-gray-900">{post.username}</p>
                <p className="text-sm text-gray-500">Author</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl  mb-6 transition ">
              <h2 className="text-xl font-bold text-black mb-2 ">
                {post.title}
              </h2>

              <p className="text-gray-400 text-sm mb-4 -mt-2 line-clamp-2">
                {post.excerpt}
              </p>

              <div className="text-gray-800 text-md leading-relaxed whitespace-pre-line">
                {post.content}
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-gray-100">
              <div className="flex items-end space-x-6">
                <div
                  className={`flex items-center space-x-2 transition-all ${
                    likerIds.includes(userId)
                      ? "text-red-500"
                      : "text-gray-500 hover:text-red-500"
                  }`}
                >
                  <LikeButton
                    postId={post.id}
                    userId={userId}
                    userName={localUserName ?? ""}
                    likerIds={likerIds}
                    onToggleLike={handleToggleLike}
                  />
                </div>

                <button className="flex items-center space-x-2 -mt-5 text-gray-500 hover:text-blue-600 transition-all">
                  <MessageCircle className="h-4 w-4" />
                  <span className="text-sm">{comments.length} Comments</span>
                </button>
              </div>
            </div>
          </div>
        </motion.article>

        {/* Comments Section */}
        <motion.div
          id="comments-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900 flex items-center">
            <MessageCircle className="h-6 w-6 mr-2 text-blue-600" />
            Comments ({comments.length})
          </h2>

          {/* Comment Form */}
          <form onSubmit={handleCommentSubmit} className="mb-8">
            <div className="relative">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                rows={3}
              />
              <button
                type="submit"
                disabled={isLoading || !newComment.trim()}
                className={`absolute bottom-3 right-3 p-2 rounded-full ${
                  isLoading || !newComment.trim()
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 transition-colors"
                } text-white`}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </form>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                >
                  <img src={commentUser} className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {comment.userName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(
                          new Date(comment.timestamp),
                          "MMM d, yyyy • h:mm a"
                        )}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-700">{comment.content}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
};

export default PostPage;
