import { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { getUsernamesByIds } from "../api/index";

interface LikesProps {
  postId: number;
  userId: number;
  userName: string;
  likerIds: number[];
  onToggleLike: () => void;
}

const LikeButtonComponent = ({
  postId,
  userId,
  userName,
  likerIds,
  onToggleLike,
}: LikesProps) => {
  const [likersNames, setLikerNames] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const hasLiked = likerIds.includes(userId);

  useEffect(() => {
    const fetchLikerNames = async () => {
      try {
        const names = await getUsernamesByIds(likerIds);
        setLikerNames(names);
      } catch (err) {
        console.error("Failed to fetch names", err);
        setError("Could not load usernames.");
      }
    };

    if (likerIds.length > 0) {
      fetchLikerNames();
    } else {
      setLikerNames([]);
    }
  }, [likerIds]);

  const otherLikers = likersNames.filter((name) => name !== userName);
  const otherCount = otherLikers.length;

  return (
    <div className="flex flex-col space-y-1">
      <div className="flex flex-col items-left space-x-1 space-y-3">
        {likersNames.length > 0 && (
          <div className="text-xs text-gray-500">
            Liked by:&nbsp;
            {hasLiked && (
              <>
                <span className="font-medium text-gray-700">You</span>
                {otherCount > 0 &&
                  ` and ${otherCount} ${otherCount === 1 ? "other" : "others"}`}
              </>
            )}
            {!hasLiked && (
              <>
                {likersNames.slice(0, 1).join(", ")}...
                {likersNames.length > 1 &&
                  ` and ${likersNames.length - 1} others`}
              </>
            )}
          </div>
        )}

        <button
          onClick={onToggleLike}
          className={`flex items-center space-x-1 focus:outline-none transition-all duration-200`}
          aria-label={hasLiked ? "Unlike" : "Like"}
        >
          <Heart
            className={`transition-colors duration-300 -mt-1 ${
              hasLiked ? "fill-red-500 text-red-500" : "text-gray-600"
            }`}
            size={18}
          />
          <span
            className={`text-sm font-medium transition-colors duration-300 ${
              hasLiked ? "text-red-500" : "text-gray-600"
            }`}
          >
            {likerIds.length}
            {"  "}
            {likerIds.length > 1 ? "Likes" : "Like"}
          </span>
        </button>

        {error && <span className="text-red-500 text-xs ml-2">{error}</span>}
      </div>
    </div>
  );
};

export default LikeButtonComponent;
