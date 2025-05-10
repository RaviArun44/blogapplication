import { useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  List,
  Cpu,
  Palette,
  Briefcase,
  Coffee,
  Menu,
  X,
  Home,
  Plus,
  Heart,
  MessageCircle,
  Send,
  Clock,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar, Footer } from "../../components";
import {
  getLikesByPostId,
  getPostsByCategory,
  getCommentsByPostId,
  addComment,
} from "../../api";
import { IPost } from "../../types/index";
import LikeButton from "../../components/likes";
import user from "../../assets/profile.png";
import commentUser from "../../assets/comment-user.jpg";
import { format } from "date-fns";
import { HeartAnimation } from "./heartAnimation";
import { toggleLike } from "../../api/likesApi";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const mainNavItems = [
  {
    name: "Home",
    icon: <Home className="h-5 w-5 text-gray-600 " />,
    path: "/",
  },
  {
    name: "Popular",
    icon: <TrendingUp className="h-5 w-5 text-gray-600" />,
    path: "/popular",
  },
];

export const BlogApp = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [savedPosts, setSavedPosts] = useState([]);
  const [isSaved, setIsSaved] = useState(false);
  const [category, setCategory] = useState("All");
  const [posts, setPosts] = useState([]);
  const [currentView, setCurrentView] = useState("home");
  const [isLoading, setIsLoading] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>(
    {}
  );

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const data = await getPostsByCategory(category);
        setPosts(data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [category]);

  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const categories = [
          "All",
          "Technology",
          "Design",
          "Business",
          "Lifestyle",
          "Health",
        ];

        const countPromises = categories.map(async (cat) => {
          const posts = await getPostsByCategory(cat === "All" ? "all" : cat);
          return { [cat]: posts.length };
        });

        const results = await Promise.all(countPromises);
        const countsObject = Object.assign({}, ...results);
        setCategoryCounts(countsObject);
      } catch (error) {
        console.error("Error fetching category counts:", error);
      }
    };

    fetchCategoryCounts();
  }, []);

  const categories = useMemo(
    () => [
      {
        name: "All",
        icon: <List className="h-5 w-5 text-gray-600" />,
        count: categoryCounts["All"] ?? 0,
      },
      {
        name: "Technology",
        icon: <Cpu className="h-5 w-5 text-primary-600" />,
        count: categoryCounts["Technology"] ?? 0,
      },
      {
        name: "Design",
        icon: <Palette className="h-5 w-5 text-pink-500" />,
        count: categoryCounts["Design"] ?? 0,
      },
      {
        name: "Business",
        icon: <Briefcase className="h-5 w-5 text-blue-500" />,
        count: categoryCounts["Business"] ?? 0,
      },
      {
        name: "Lifestyle",
        icon: <Coffee className="h-5 w-5 text-yellow-500" />,
        count: categoryCounts["Lifestyle"] ?? 0,
      },
      {
        name: "Health",
        icon: <Heart className="h-5 w-5 text-red-500" />,
        count: categoryCounts["Health"] ?? 0,
      },
    ],
    [posts]
  );

  const filteredPosts = useMemo(() => {
    let filteredResults = [...posts];

    if (currentView === "saved") {
      return filteredResults.filter((post) => savedPosts.includes(post.id));
    } else if (currentView === "popular") {
      return [...filteredResults]
        .sort((a, b) => b.likes.length - a.likes.length)
        .slice(0, 3);
    } else if (activeCategory !== "All") {
      return filteredResults.filter((post) => post.category === activeCategory);
    }

    return filteredResults;
  }, [posts, currentView, activeCategory, savedPosts]);

  const handleCategoryClick = useCallback((selectedCategory: string) => {
    setActiveCategory(selectedCategory);
    setCategory(selectedCategory);
    setCurrentView("home");
    setSidebarOpen(false);
  }, []);

  const handleNavItemClick = useCallback((view: any) => {
    setCurrentView(view);
    if (view !== "home") {
      setActiveCategory("All");
    }
    setSidebarOpen(false);
  }, []);

  const navigateToPostPage = (post: IPost) => {
    navigate("/post", { state: { post } });
  };

  const Navigation = useMemo(() => {
    return (
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-sm font-bold mb-4">Navigation</h3>
        <ul className="space-y-2">
          {mainNavItems.map((item) => (
            <li key={item.name}>
              <div
                onClick={() => handleNavItemClick(item.name.toLowerCase())}
                className={`flex items-center gap-3 p-2 rounded-md w-full cursor-pointer text-left ${
                  currentView === item.name.toLowerCase()
                    ? "text-black font-bold -ml-2"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                <span
                  className={
                    currentView === item.name.toLowerCase()
                      ? "p-2 bg-gray-200 rounded-4xl"
                      : "hover:bg-gray-100 text-gray-600"
                  }
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }, [currentView, handleNavItemClick]);

  const CategorySection = useMemo(() => {
    return (
      <div className="bg-white rounded-xl shadow p-4">
        <h3 className="text-sm font-bold mb-4">Categories</h3>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => handleCategoryClick("All")}
              className={`flex justify-between items-center p-2 rounded-md w-full text-left ${
                activeCategory === "All" && currentView === "home"
                  ? "bg-primary-50 text-primary-700"
                  : "hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center gap-3">
                <List className="h-5 w-5 text-gray-600" />
                <span>All Posts</span>
              </div>
              <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                {categoryCounts["All"]}
              </span>
            </button>
          </li>
          {categories.slice(1).map((category) => (
            <li key={category.name}>
              <button
                onClick={() => handleCategoryClick(category.name)}
                className={`flex justify-between items-center p-2 rounded-md w-full text-left ${
                  activeCategory === category.name && currentView === "home"
                    ? "text-black font-bold"
                    : "hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  {category.icon}
                  <span>{category.name}</span>
                </div>
                <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full">
                  {category.count}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }, [
    activeCategory,
    currentView,
    categories,
    handleCategoryClick,
    posts.length,
  ]);

  const MobileSidebar = useCallback(
    () => (
      <>
        <div className="fixed top-18 left-2 z-50 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-full bg-black/80 shadow-md backdrop-blur-sm"
          >
            <Menu className="h-5 w-5 text-white" />
          </button>
        </div>

        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                onClick={() => setSidebarOpen(false)}
              />

              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="fixed top-0 left-0 w-4/5 max-w-xs h-full bg-white z-50 shadow-lg overflow-y-auto"
              >
                <div className="flex justify-between items-center p-4 border-b">
                  <div className="flex items-center gap-2">
                    <List className="h-6 w-6 text-primary-600" />
                    <span className="font-bold text-gray-900">BlogApp</span>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="p-2">
                    <X className="h-6 w-6 text-gray-600" />
                  </button>
                </div>
                {Navigation}
                {CategorySection}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    ),
    [isSidebarOpen, Navigation, CategorySection]
  );

  const DesktopSidebar = useCallback(
    () => (
      <div className="hidden lg:block w-64">
        <div className="sticky top-24 space-y-6">
          {Navigation}
          {CategorySection}
        </div>
      </div>
    ),
    [Navigation, CategorySection]
  );

  const PostCard = ({ post }: any) => {
    const [likerIds, setLikerIds] = useState<number[]>([]);
    const [showHeart, setShowHeart] = useState(false);
    const [firstShowHeart, setFirstShowHeart] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [newComment, setNewComment] = useState("");
    const [isOpen, setOpen] = useState(false);
    const [error, setError] = useState("");

    const userId = parseInt(localStorage.getItem("id") || "0", 10);
    const userName = localStorage.getItem("username") || "";

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
                alt={post.username}
                className="w-12 h-12 rounded-full object-cover border-2 border-primary-500 shadow-sm"
                loading="lazy"
              />

              <div className="w-full">
                <span className="text-lg font-semibold text-gray-800">
                  {post.username}
                </span>
                <div className="items-center flex justify-between space-x-10">
                  <p className="text-xs text-gray-500">
                    on {format(new Date(post.createdAt), "MMM d, yyyy")}
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
    if (isLoading) {
      return (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Loading posts...
          </h3>
        </div>
      );
    }

    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="lg:col-span-7 order-2 lg:order-1 space-y-6"
      >
        <header className="mt-4 mb-6">
          <h1 className="text-2xl md:text-3xl text-center font-bold text-gray-900">
            {currentView === "saved"
              ? "Saved Posts"
              : currentView === "popular"
              ? "Popular Posts"
              : activeCategory === "All"
              ? "All Posts"
              : `${activeCategory} Posts`}
          </h1>
          <p className="text-gray-600 mt-2 text-center ">
            {currentView === "saved"
              ? "Your bookmarked articles for later reading"
              : currentView === "popular"
              ? "Most liked articles across all categories"
              : activeCategory === "All"
              ? "Browse through our latest articles"
              : `Explore our best ${activeCategory.toLowerCase()} content`}
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 xl:grid-cols-3 xl:gap-4">
          {filteredPosts.length > 0 ? (
            filteredPosts.map((post) => (
              <div key={post.id} className="flex">
                <PostCard post={post} />
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white rounded-xl shadow-md p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No posts found
              </h3>
              <p className="text-gray-500">
                {currentView === "saved"
                  ? "You haven't saved any posts yet. Browse and bookmark posts to see them here."
                  : "No posts available for this category at the moment. Check back later!"}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  }, [isLoading, currentView, activeCategory, filteredPosts, PostCard]);

  const FabButton = useCallback(() => {
    return (
      <button className="lg:hidden fixed bottom-6 right-6 z-50 bg-gray-900 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition duration-300">
        <Plus className="w-6 h-6" />
      </button>
    );
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto pt-20 px-4">
        <div className="flex flex-col lg:flex-row gap-8">
          <MobileSidebar />
          <DesktopSidebar />

          <div className="flex-1 md:p-4  from-blue-800 via-indigo-700 to-purple-800">
            <MainContent />
          </div>
        </div>
      </div>

      <Link to="/createPost">
        <FabButton />
      </Link>

      <Footer />
    </div>
  );
};

export default BlogApp;
