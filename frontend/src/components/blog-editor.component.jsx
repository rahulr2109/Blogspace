import { Link, useNavigate, useParams } from "react-router-dom";
import logo from "../imgs/logo.png";
import AnimationWrapper from "../common/page-animation";
import defaultBanner from "../imgs/blog banner.png";
import { useContext, useEffect, useRef, useState } from "react";
import { EditorContext } from "../pages/editor.pages";
import { toast, Toaster } from "react-hot-toast";
import EditorJS from "@editorjs/editorjs";
import { tools } from "./tools.component";
import axios from "axios";
import { UserContext } from "../App";

const BlogEditor = () => {
  const {
    blog,
    blog: { title, banner, content, tags, des },
    setBlog,
    setTextEditor,
    editorState,
    setEditorState,
  } = useContext(EditorContext);

  const { userAuth: { access_token } } = useContext(UserContext);

  const { blog_id } = useParams();
  const navigate = useNavigate();

  const [editorLoaded, setEditorLoaded] = useState(false); // To ensure editor loads correctly
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorLoaded) return; // Only initialize editor once

    const editor = new EditorJS({
      holder: editorRef.current,
      data: Array.isArray(content) ? content[0] : content,
      tools: tools,
      placeholder: "Let's write an awesome story",
    });

    setTextEditor(editor);
    setEditorLoaded(true); // Mark editor as loaded
  }, [editorLoaded, content, setTextEditor]);

  const handleBannerUpload = (img) => {
    if (img) {
      let loadingToast = toast.loading("Uploading...");

      const VITE_CLOUD_CONFIG = import.meta.env.VITE_CLOUD_CONFIG;

      const data = new FormData();
      data.append("file", img);
      data.append("upload_preset", "blogging app");
      data.append("cloud_name", "dccadxaam");
      fetch(VITE_CLOUD_CONFIG, {
        method: "post",
        body: data,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.url) {
            toast.dismiss(loadingToast);
            toast.success("Uploaded");
            setBlog({ ...blog, banner: data.url });
          }
        })
        .catch((err) => {
          toast.dismiss(loadingToast);
          toast.error(err);
        });
    } else {
      toast.error("Please Select an Image");
    }
  };

  const handleTitleKeyDown = (e) => {
    if (e.keyCode === 13) {
      // Prevent default behavior on Enter key
      e.preventDefault();
    }
  };

  const handleTitleChange = (e) => {
    let input = e.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
    setBlog({ ...blog, title: input.value });
  };

  const handleError = (e) => {
    e.target.src = defaultBanner;
  };

  const handlePublishEvent = () => {
    if (!banner.length) {
      return toast.error("Upload a blog banner to publish it");
    }
    if (!title.length) {
      return toast.error("Write blog to publish it");
    }

    if (editorLoaded && textEditor) {
      textEditor
        .save()
        .then((data) => {
          if (data.blocks.length) {
            setBlog({ ...blog, content: data });
            setEditorState("publish");
          } else {
            return toast.error("Write something in your blog to publish it");
          }
        })
        .catch((err) => {
          return toast.error(err);
        });
    }
  };

  const handleSaveDraft = (e) => {
    if (e.target.className.includes("disable")) {
      return;
    }
    if (!title.length) {
      return toast.error("Write blog title before saving it as a draft");
    }

    let loadingToast = toast.loading("Saving Draft...");

    e.target.classList.add("disable");

    if (editorLoaded && textEditor) {
      textEditor.save().then((content) => {
        let blogObj = {
          title,
          banner,
          des,
          content,
          tags,
          draft: true,
        };

        axios
          .post(
            `${import.meta.env.VITE_SERVER_DOMAIN}/create-blog`,
            { ...blogObj, id: blog_id },
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
              },
            }
          )
          .then(() => {
            e.target.classList.remove("disable");
            toast.dismiss(loadingToast);

            setTimeout(() => {
              navigate("/");
            }, 500);
          })
          .catch(({ response }) => {
            e.target.classList.remove("disable");
            toast.dismiss(loadingToast);
            toast.error(response.data.error);
          });
      });
    }
  };

  return (
    <>
      <nav className="navbar">
        <Link to="/" className="flex-none w-10">
          <img src={logo} alt="logo" />
        </Link>
        <p className="max-md:hidden text-black line-clamp-1 w-full">
          {title.length ? title : "New Blog"}
        </p>

        <div className="flex gap-4 ml-auto">
          <button className="btn-dark py-2" onClick={handlePublishEvent}>
            Publish
          </button>
          <button className="btn-light py-2" onClick={handleSaveDraft}>
            Save Draft
          </button>
        </div>
      </nav>

      <AnimationWrapper>
        <section>
          <Toaster />
          <div className="mx-auto max-w-[900px] w-full">
            <div className="relative aspect-video hover:opacity-80 bg-white border-4 border-grey">
              <label htmlFor="uploadBanner">
                <img src={banner} alt="Banner" onError={handleError} />
                <input
                  id="uploadBanner"
                  type="file"
                  accept=".png, .jpg, .jpeg"
                  hidden
                  onChange={(e) => handleBannerUpload(e.target.files[0])}
                />
              </label>
            </div>
            <textarea
              defaultValue={title}
              placeholder="Blog Title"
              className="text-4xl font-medium w-full h-20 outline-none resize-none mt-10 leading-tight placeholder:opacity-40"
              onKeyDown={handleTitleKeyDown}
              onChange={handleTitleChange}
            />

            <hr className="w-full opacity-10 my-5" />

            {/* EditorJS container */}
            <div ref={editorRef} className="font-gelasio"></div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
