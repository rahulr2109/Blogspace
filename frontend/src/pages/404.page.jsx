import { Link } from "react-router-dom";
import fullLogo from "@images/full-logo.png";
import pageNotFoundImage from "@images/404.png";

const PageNotFound = () => {
  return (
    <section className="h-cover relative p-10 flex flex-col items-center gap-20 text-center">
      <img
        src={pageNotFoundImage}
        className="select-none border-2 border-grey w-72 aspect-square object-cover rounded"
      />

      <h1 className="text-4xl font-gelasio leading-7">Page not found</h1>
      <p className="text-dark-grey text-xl leading-7 -mt-8">
        The page you are looking for does not exists. Head back to the{" "}
        <Link to={"/"} className="text-black underline">
          home page
        </Link>
      </p>
      <div className="mt-auto">
        <img
          src={fullLogo}
          className="h-8 object-contain block mx-auto select-none"
        />
        <p className="text-dark-grey mt-5">
          Read millions of stories around the world
        </p>
      </div>
    </section>
  );
};

export default PageNotFound;
