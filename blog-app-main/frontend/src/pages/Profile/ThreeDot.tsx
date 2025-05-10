// import { useState, useRef, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { MoreVertical, Trash2, Pencil } from "lucide-react"; // or any 3-dot icon you prefer
// import { deletePost } from "../../api";
// import Swal from "sweetalert2";
// import { UpdateModal } from "./UpdatePostModel";

// const ThreeDotMenu = ({ post }) => {
//   const [open, setOpen] = useState(false);
//   const menuRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
//         setOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const [isDeleting, setIsDeleting] = useState(false);
//   const [modalOpen, setModalOpen] = useState(false);

//   const handleDeletePost = async () => {
//     const userId = localStorage.getItem("id");

//     if (!userId) {
//       Swal.fire({
//         title: "Error!",
//         text: "You need to be logged in to delete posts",
//         icon: "error",
//         confirmButtonText: "OK",
//       });
//       return;
//     }

//     const result = await Swal.fire({
//       title: "Are you sure?",
//       text: "You won't be able to revert this!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       cancelButtonColor: "#3085d6",
//       confirmButtonText: "Yes, delete it!",
//     });

//     // If user confirms deletion
//     if (result.isConfirmed) {
//       setIsDeleting(true);

//       try {
//         // Call the API to delete the post
//         await deletePost(post.id, userId);

//         // Close the modal/dropdown if there is one
//         if (setOpen) {
//           setOpen(false);
//         }

//         await Swal.fire("Deleted!", "Your post has been deleted.", "success");
//         window.location.reload();
//       } catch (error) {
//         console.error("Error deleting post:", error);

//         // Show error message
//         Swal.fire({
//           title: "Error!",
//           text: error.response?.data || "Failed to delete post",
//           icon: "error",
//           confirmButtonText: "OK",
//         });
//       } finally {
//         setIsDeleting(false);
//       }
//     }
//   };

//   return (
//     <div className="flex flex-end justify-end" ref={menuRef}>
//       <button
//         onClick={() => setModalOpen(!modalOpen)}
//         className="py-2 rounded-full cursor-pointer"
//       >
//         <MoreVertical size={20} />
//       </button>

//       <AnimatePresence>
//         {open && (
//           <motion.div
//             initial={{ opacity: 0, y: 0 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0, y: 0 }}
//             transition={{ duration: 0.2 }}
//             className="absolute right-4 mt-8 w-40 bg-white rounded-md shadow-lg z-10 border"
//           >
//             <div className="py-1">
//               <button
//                 onClick={() => {
//                   setModalOpen(!modalOpen);
//                 }}
//                 className="w-full flex gap-3 px-4 py-2 text-left text-sm hover:bg-gray-100 cursor-pointer"
//               >
//                 <Pencil className="h-4 w-4" />
//                 Update Post
//               </button>
//               <button
//                 onClick={handleDeletePost}
//                 disabled={isDeleting}
//                 className="w-full flex gap-3 px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100 cursor-pointer"
//               >
//                 <Trash2 className="h-4 w-4" />
//                 {isDeleting ? "Deleting..." : "Delete Post"}
//               </button>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//       <UpdateModal open={modalOpen} onClose={() => setModalOpen(false)} />
//     </div>
//   );
// };

// export default ThreeDotMenu;
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MoreVertical, Trash2, Pencil } from "lucide-react";
import { deletePost } from "../../api";
import Swal from "sweetalert2";
import { UpdateModal } from "./UpdatePostModel";

const ThreeDotMenu = ({ post }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDeletePost = async () => {
    const userId = localStorage.getItem("id");

    if (!userId) {
      Swal.fire({
        title: "Error!",
        text: "You need to be logged in to delete posts",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      setIsDeleting(true);
      try {
        await deletePost(post.id, userId);
        setMenuOpen(false);
        await Swal.fire("Deleted!", "Your post has been deleted.", "success");
        window.location.reload();
      } catch (error) {
        console.error("Error deleting post:", error);
        Swal.fire({
          title: "Error!",
          text: error.response?.data || "Failed to delete post",
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="relative flex justify-end" ref={menuRef}>
      {/* 3-dot button toggles dropdown only */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="p-2 rounded-full hover:bg-gray-100"
      >
        <MoreVertical size={20} />
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-10 w-40 bg-white rounded-md shadow-lg z-10 border"
          >
            <div className="py-1">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setModalOpen(true); // Open modal only on "Update Post"
                }}
                className="w-full flex gap-3 px-4 py-2 text-left text-sm hover:bg-gray-100"
              >
                <Pencil className="h-4 w-4" />
                Update Post
              </button>

              <button
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="w-full flex gap-3 px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? "Deleting..." : "Delete Post"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Only show modal if modalOpen is true */}
      {modalOpen && (
        <UpdateModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          post={post}
        />
      )}
    </div>
  );
};

export default ThreeDotMenu;
