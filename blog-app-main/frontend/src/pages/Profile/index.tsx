import { useCallback, useEffect, useState } from "react";
import profile from "../../assets/profile.png";
import { Navbar, Footer } from "../../components";
import { useNavigate } from "react-router-dom";
import { Clock, LogOutIcon, MessageCircle, Send } from "lucide-react";
import { toast } from "react-toastify";
import {
  addComment,
  fetchPostsByUserId,
  getCommentsByPostId,
  getLikesByPostId,
} from "../../api";
import { AnimatePresence, motion } from "framer-motion";
import LikeButton from "../../components/likes";
import { toggleLike } from "../../api/likesApi";
import { HeartAnimation } from "../Home/heartAnimation";
import { format } from "date-fns";
import { IPost } from "../../types";
import user from "../../assets/profile.png";
import ThreeDot from "../Profile/ThreeDot";
import commentUser from "../../assets/comment-user.jpg";

const Profile = () => {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    profileVisibility: "public",
  });

  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    const storedEmail = localStorage.getItem("email");

    if (storedUsername) setUserName(storedUsername);
    if (storedEmail) setEmail(storedEmail);

    const userId = parseInt(localStorage.getItem("id") || "0");
    if (userId) {
      const getPosts = async () => {
        try {
          const fetchedPosts = await fetchPostsByUserId(userId);

          setPosts(fetchedPosts);
        } catch (err) {
          setError("Failed to fetch posts.");
        } finally {
          setLoading(false);
        }
      };

      getPosts();
    }
  }, []);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");

    if (storedUsername) setUserName(storedUsername);
  }, []);

  const handleEmailNotificationsChange = () => {
    setSettings({
      ...settings,
      emailNotifications: !settings.emailNotifications,
    });
    console.log("Email notifications set to:", !settings.emailNotifications);
  };

  const handleProfileVisibilityChange = (event: { target: { value: any } }) => {
    setSettings({
      ...settings,
      profileVisibility: event.target.value,
    });
    console.log("Profile visibility set to:", event.target.value);
  };

  const navigateToPostPage = (post: IPost) => {
    navigate("/post", { state: { post } });
  };

  const _logout = () => {
    localStorage.removeItem("id"); // or whatever key you use
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    toast.success("Logout Successfully");
    navigate("/");
  };

  const PostCard = ({ post }: any) => {
    const [likerIds, setLikerIds] = useState<number[]>([]);
    const [showHeart, setShowHeart] = useState(false);
    const [firstShowHeart, setFirstShowHeart] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isOpen, setOpen] = useState(false);
    const [error, setError] = useState("");

    const userId = parseInt(localStorage.getItem("id") || "0", 10);

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
      if (!firstShowHeart) {
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
        setFirstShowHeart(true); // only once
      }
      setShowHeart(true);
      setTimeout(() => {
        setShowHeart(false);
      }, 1000);
    };

    useEffect(() => {
      if (isOpen && post?.id) {
        const fetchComments = async () => {
          try {
            const fetched = await getCommentsByPostId(post.id);
            if (Array.isArray(fetched)) {
              const processedComments = fetched.map((comment) => ({
                id: comment.id,
                userId: comment.userId,
                userName: comment.author,
                text: comment.message || "",
                timestamp: comment.createdAt || new Date(),
              }));
              setComments(processedComments);
            } else {
              console.error("Unexpected data format:", fetched);
              setComments([]);
            }
          } catch (err) {
            console.error("Failed to fetch comments", err);
            setError("Could not load comments.");
          }
        };
        fetchComments();
      }
    }, [isOpen, post?.id]);

    const handleCommentSubmit = async () => {
      if (newComment.trim()) {
        try {
          await addComment(post.id, userId, newComment);
          setComments([...comments, { userName, text: newComment }]);
          setNewComment("");
        } catch (err) {
          console.error("Failed to add comment", err);
        }
      }
    };

    return (
      <div className="relative w-full">
        {/* Comment Modal Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-30 bg-black/20 backdrop-blur-sm flex items-end"
              onClick={() => setOpen(false)} // clicking on backdrop closes modal
            >
              <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside modal
                className="w-full bg-white h-[380px] rounded-t-xl p-4 shadow-xl"
              >
                {/* Comment Input */}
                <div className="flex items-start gap-2 mb-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1 border border-gray-300 p-2 rounded-md text-sm resize-none"
                    placeholder="Write a comment..."
                    rows={2}
                  />
                  <button
                    onClick={handleCommentSubmit}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    <Send size={18} />
                  </button>
                </div>

                {/* Comment List */}
                <div className="space-y-3 max-h-60 overflow-y-auto bg-gray-50 rounded-md p-2">
                  {comments.length > 0 ? (
                    comments.map((comment, index) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white p-3 flex flex-col rounded-md shadow-sm border border-gray-200"
                      >
                        <div className="flex-1 flex">
                          <img
                            src={commentUser}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="flex flex-col flex-wrap items-start gap-0">
                            <span className="font-medium text-gray-900">
                              {comment.userName}
                            </span>

                            <span className="text-xs text-gray-500">
                              {(() => {
                                try {
                                  return format(
                                    new Date(
                                      comment.timestamp.replace(" ", "T")
                                    ),
                                    "MMM d, yyyy • h:mm a"
                                  );
                                } catch {
                                  return format(
                                    new Date(),
                                    "MMM d, yyyy • h:mm a"
                                  );
                                }
                              })()}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="mt-2 text-gray-700">{comment.text}</p>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-gray-500">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                </div>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                <div className="flex justify-end mt-4">
                  <button
                    onClick={() => setOpen(false)}
                    className="text-sm text-gray-600 hover:text-red-500"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Post Card */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300">
          <div className="p-4" onDoubleClick={handleDoubleClick}>
            <div className="-mt-2">
              <ThreeDot post={post} />
            </div>
            <div className="relative w-full mb-4 h-64 overflow-hidden cursor-pointer">
              <img
                src={post.coverImage}
                alt={post.title}
                className="w-full h-full mb-2 object-fit transition-transform duration-500 hover:scale-105"
                loading="lazy"
              />
              {showHeart && <HeartAnimation showHeart={showHeart} />}
            </div>

            <div className="flex items-center gap-3 mb-5">
              <img
                src={user}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary-500 shadow-sm"
                loading="lazy"
              />

              <div className="w-full">
                <span className="text-lg font-semibold text-gray-800">
                  {userName}
                </span>
                <div className="items-center flex justify-between space-x-10">
                  <p className="text-xs text-gray-500">
                    on{" "}
                    {post.createdAt
                      ? format(new Date(post.createdAt), "MMM d, yyyy")
                      : "Unknown date"}
                  </p>
                  <div className="text-sm items-end text-white bg-black px-1.5 py-1 rounded-md -mt-2">
                    {post.category}
                  </div>
                </div>
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

            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center justify-between w-full text-sm text-gray-500">
                <div
                  onClick={() => navigateToPostPage(post)}
                  className="text-blue-600 cursor-pointer items-start"
                >
                  <span className="z-10">View more</span>
                  <span className="absolute left-0 bottom-[-2px] h-[2px] w-0 bg-blue-600 transition-all duration-300 group-hover:w-full" />
                </div>
                <span className="flex items-center gap-1">
                  <Clock size={16} />5 min read
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-4 border-gray-100">
              <LikeButton
                postId={post.id}
                userId={userId}
                userName={userName}
                likerIds={likerIds}
                onToggleLike={handleToggleLike}
              />
              <div
                className="md:mt-2 md:flex-10 flex items-center md:justify-around sm:justify-between border-none pt-4 
                 mt-[0px] ml-[-50px] gap-[10px]
                 sm:mt-0 sm:ml-0 sm:gap-0"
              >
                <button
                  onClick={() => setOpen(!isOpen)}
                  className="flex items-center gap-1 text-sm text-gray-700 hover:text-blue-600"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Comment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const MainContent = useCallback(() => {
    return (
      <motion.div
        initial="hidden"
        animate="show"
        className="lg:col-span-7 order-2 lg:order-1 space-y-6"
      >
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6 ">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={post.id} className="flex">
                <PostCard post={post} />
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-xl shadow-md p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No posts found
              </h3>
            </div>
          )}
        </div>
      </motion.div>
    );
  }, [PostCard]);

  return (
    <div>
      <div className="mb-20">
        <Navbar />
      </div>
      <div className="max-w-4xl mx-auto my-10 px-4">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-10">
          {/* Hero Banner with Geometric Pattern */}
          <div className="relative h-48 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700">
            <div className="absolute inset-0 opacity-20">
              <div
                className="h-full w-full"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 25px 25px, rgba(255,255,255,0.2) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255,255,255,0.2) 2%, transparent 0%)",
                  backgroundSize: "100px 100px",
                }}
              ></div>
            </div>
          </div>

          <div className="px-8 pb-8">
            {/* Profile Section */}
            <div className="flex flex-col items-center -mt-24">
              <div className="p-1.5 z-10  rounded-full bg-white shadow-lg">
                <img
                  src={profile}
                  className="w-36 h-36 rounded-full object-cover"
                />
              </div>

              <h1 className="mt-6 text-3xl font-bold text-gray-800">
                {userName}
              </h1>
              <p className="text-indigo-600 font-medium">{email}</p>
            </div>

            {/* Settings Section */}
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Account Settings
                </h2>
              </div>

              <div className="space-y-6">
                {/* Email Notifications */}
                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition duration-300">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">
                      Email Notifications
                    </h3>
                    <p className="text-gray-500">
                      Receive email updates about your activity
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={settings.emailNotifications}
                      onChange={handleEmailNotificationsChange}
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                {/* Profile Visibility */}
                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-xl hover:bg-gray-100 transition duration-300">
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">
                      Profile Visibility
                    </h3>
                    <p className="text-gray-500">
                      Choose who can see your profile
                    </p>
                  </div>
                  <select
                    className="px-4 py-2.5 border border-gray-300 rounded-lg bg-white text-gray-800 font-medium shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={settings.profileVisibility}
                    onChange={handleProfileVisibilityChange}
                  >
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-between space-x-2">
              <div
                className="inline-flex items-center space-x-2 bg-gradient-to-r cursor-pointer from-red-500 to-red-700 text-white py-3 px-4 rounded-lg shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={() => {
                  _logout();
                }}
              >
                <LogOutIcon size={20} className="text-white" />
                <div className="text-sm font-semibold tracking-wide">
                  Logout
                </div>
              </div>
              <button
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-300"
                onClick={(e) => {
                  toast.success("Profile Updated");
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
        <h2 className="text-3xl text-center font-bold text-gray-900 mb-6   pb-2">
          My Posts
        </h2>
        <div>
          <MainContent />
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
