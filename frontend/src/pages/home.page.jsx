import { useEffect, useState } from "react";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import axios from "axios";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import { activeTabRef } from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";
import { toast, Toaster } from "react-hot-toast";

const HomePage = () => {
  let [blogs, setBlogs] = useState(null);
  let [trendingBlogs, setTrendingBlogs] = useState(null);
  let [pageState, setPageState] = useState("home");

  // blogs = {
  //   results : { blogs: [{},{},{}] },
  //   page:1,
  //   totalDocs:10
  // }

  let categories = [
    "programming",
    "hollywood",
    "film making",
    "social media",
    "cooking",
    "tech",
    "finance",
    "travel",
  ];

  const fetchLatestBlog = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/api/blog/latest-blogs", {
        page,
      })
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: blogs,
          data: data,
          page,
          countRoute: "/api/blog/all-latest-blogs-count",
        });

        //console.log("Formatted data:", formatedData);
        setBlogs(formatedData);
      })
      .catch((err) => {
        //console.error("Error fetching latest blogs:", err);
        toast.error("Failed to fetch latest blogs");
      });
  };

  const fetchBlogsByCategory = ({ page = 1 }) => {
    axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + "/api/blog/search-blogs", {
        tag: pageState,
        page,
      })
      .then(async ({ data }) => {
        let formatedData = await filterPaginationData({
          state: blogs,
          data: data,
          page,
          countRoute: "/api/blog/search-blogs-count",
          data_to_send: { tag: pageState },
        });

        //console.log("Formatted data (category):", formatedData);
        setBlogs(formatedData);
      })
      .catch((err) => {
        //console.error("Error fetching blogs by category:", err);
        toast.error("Failed to fetch blogs by category");
      });
  };

  const fetchTrendingBlog = () => {
    axios
      .get(import.meta.env.VITE_SERVER_DOMAIN + "/api/blog/trending-blogs")
      .then(({ data }) => {
        //console.log("Trending blogs data:", data);
        setTrendingBlogs(data.blogs);
      })
      .catch((err) => {
        //console.error("Error fetching trending blogs:", err);
        toast.error("Failed to fetch trending blogs");
      });
  };

  const loadingBlogByCategory = (e) => {
    let category = e.target.innerText.toLowerCase();

    setBlogs(null);

    if (pageState == category) {
      setPageState("home");
    } else {
      setPageState(category);
    }
  };

  useEffect(() => {
    activeTabRef.current.click();

    if (pageState == "home") {
      fetchLatestBlog({ page: 1 });
    } else {
      fetchBlogsByCategory({ page: 1 });
    }
    if (!trendingBlogs) {
      fetchTrendingBlog();
    }
  }, [pageState]);

  // Debug useEffect to monitor blogs state changes
  useEffect(() => {
    //console.log("Blogs state updated:", blogs);
  }, [blogs]);

  return (
    <AnimationWrapper>
      <section className="h-cover flex justify-center gap-10">
        <Toaster />
        {/* latest blogs*/}
        <div className="w-full">
          <InPageNavigation
            routes={[pageState, "trending blogs"]}
            defaultHidden={["trending blogs"]}
          >
            <>
              {blogs == null ? (
                <Loader />
              ) : blogs.results && blogs.results.blogs && blogs.results.blogs.length ? (
                blogs.results.blogs.map((blog, i) => {
                  return (
                    <AnimationWrapper
                      key={i}
                      transition={{ duration: 1, delay: i * 0.1 }}
                    >
                      <BlogPostCard
                        content={blog}
                        author={blog.author.personal_info}
                      />
                    </AnimationWrapper>
                  );
                })
              ) : (
                <NoDataMessage message="No blogs published" />
              )}
              
              {/* Load More Button */}
              {blogs && blogs.results && blogs.results.blogs && (
                <LoadMoreDataBtn
                  state={blogs}
                  fetchDataFun={
                    pageState == "home" ? fetchLatestBlog : fetchBlogsByCategory
                  }
                />
              )}
            </>
            <>
              {trendingBlogs == null ? (
                <Loader />
              ) : trendingBlogs.length ? (
                trendingBlogs.map((blog, i) => {
                  return (
                    <AnimationWrapper
                      key={i}
                      transition={{ duration: 1, delay: i * 0.1 }}
                    >
                      <MinimalBlogPost blog={blog} index={i} />
                    </AnimationWrapper>
                  );
                })
              ) : (
                <NoDataMessage message="No trending blogs" />
              )}
            </>
          </InPageNavigation>
        </div>

        {/* filters and trending blogs */}
        <div className="min-w[40%] lg:min-w-[400px] max-w-min border-l border-grey pl-8 pt-3 max-md:hidden">
          <div className="flex flex-col gap-10">
            {/*Filter*/}
            <div>
              <h1 className="font-medium text-xl mb-8">
                Stories from all interests
              </h1>

              <div className="flex gap-3 flex-wrap">
                {categories.map((category, i) => {
                  return (
                    <button
                      onClick={loadingBlogByCategory}
                      className={
                        "tag " +
                        (pageState == category ? " bg-black text-white " : " ")
                      }
                      key={i}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
            </div>

            {/*Trending*/}
            <div>
              <h1 className="font-medium text-xl mb-8">
                Trending
                <i className="fi fi-rr-arrow-trend-up"></i>
              </h1>
              {trendingBlogs == null ? (
                <Loader />
              ) : trendingBlogs.length ? (
                trendingBlogs.map((blog, i) => {
                  return (
                    <AnimationWrapper
                      key={i}
                      transition={{ duration: 1, delay: i * 0.1 }}
                    >
                      <MinimalBlogPost blog={blog} index={i} />
                    </AnimationWrapper>
                  );
                })
              ) : (
                <NoDataMessage message="No trending blogs" />
              )}
            </div>
          </div>
        </div>
      </section>
    </AnimationWrapper>
  );
};

export default HomePage;