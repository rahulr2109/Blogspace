import { Link } from "react-router-dom";

const UserCard = ({ user }) => {
  return (
    <Link
      to={`/user/${user.personal_info.username}`}
      className="flex items-center gap-4 mb-5"
    >
      <img
        src={user.personal_info.profile_img}
        alt="profile_pic"
        className="w-12 h-12 rounded-full overflow-hidden"
      />
      <div className="flex flex-col">
        <h3 className="font-medium line-clamp-2 text-xl">
          {user.personal_info.fullname}
        </h3>
        <p className="text-dark-grey">@{user.personal_info.username}</p>
      </div>
    </Link>
  );
};

export default UserCard;
