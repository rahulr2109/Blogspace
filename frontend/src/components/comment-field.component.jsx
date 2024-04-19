import { useContext, useState } from "react";
import { UserContext } from "../App";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { BlogContext } from "../pages/blog.page";

const CommentField = ({
  action,
  index = undefined,
  replyingTo = undefined,
  setReplying,
}) => {
  let {
    blog,
    blog: {
      _id,
      author: { _id: blog_author },
      comments,
      comments: { results: commentArr },
      activity,
      activity: { total_comments, total_parent_comments },
    },
    setBlog,
    setTotalParentCommentsLoaded,
  } = useContext(BlogContext);

  let {
    userAuth: { access_token, username, fullname, profile_img },
  } = useContext(UserContext);

  const [comment, setComment] = useState("");

  const handleComment = () => {
    if (!access_token) {
      return toast.error("Please login to comment");
    }

    if (!comment.length) {
      return toast.error("Comment can't be empty");
    }

    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/add-comment",
        { _id, comment, blog_author, replying_to: replyingTo },
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        }
      )
      .then(({ data }) => {
        setComment("");

        data.commented_by = {
          personal_info: {
            username,
            profile_img,
            fullname,
          },
        };

        let newCommentArr;

        if (replyingTo) {
          commentArr[index].children.push(data._id);

          data.childrenLevel = commentArr[index].childrenLevel + 1;

          data.parentIndex = index;

          commentArr[index].isReplying = true;

          commentArr.splice(index + 1, 0, data);

          newCommentArr = commentArr;

          setReplying((preVal) => !preVal);
        } else {
          data.childrenLevel = 0;

          newCommentArr = [data, ...commentArr];
        }

        let parentCommentIncrementVal = replyingTo ? 0 : 1;

        setBlog({
          ...blog,
          comments: { results: newCommentArr },
          activity: {
            ...activity,
            total_comments: total_comments + 1,
            total_parent_comments:
              total_parent_comments + parentCommentIncrementVal,
          },
        });

        setTotalParentCommentsLoaded(
          (preVal) => preVal + parentCommentIncrementVal
        );
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something went wrong");
      });
  };
  return (
    <>
      <Toaster />
      <textarea
        value={comment}
        onChange={(e) => {
          setComment(e.target.value);
        }}
        placeholder="Leave a comment..."
        className="input-box pl-5 placeholder:text-dark-grey resize-none h-[150px] overflow-auto"
      ></textarea>
      <button className="btn-dark mt-5 px-10" onClick={handleComment}>
        {action}
      </button>
    </>
  );
};
export default CommentField;
