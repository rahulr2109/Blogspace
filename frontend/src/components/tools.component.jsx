import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Marker from "@editorjs/marker";
import InlineCode from "@editorjs/inline-code";

const uploadImageByUrl = (e) => {
  let link = new Promise((resolve, reject) => {
    try {
      resolve(e);
    } catch (err) {
      reject(err);
    }
  });

  return link
    .then((url) => {
      return {
        success: 1,
        file: { url },
      };
    })
    .catch((err) => {
      console.log(err);
    });
};

const uploadImageByFile = (e) => {
  const data = new FormData();
  data.append("file", e);
  data.append("upload_preset", "blogging app");
  data.append("cloud_name", "dccadxaam");

  return fetch("https://api.cloudinary.com/v1_1/dccadxaam/image/upload", {
    method: "post",
    body: data,
  })
    .then((res) => res.json())
    .then((data) => data.url.toString())
    .then((url) => {
      return {
        success: 1,
        file: { url },
      };
    });
};

export const tools = {
  embed: Embed,
  list: {
    class: List,
    inlineToolbar: true,
  },
  image: {
    class: Image,
    config: {
      uploader: {
        uploadByUrl: uploadImageByUrl,
        uploadByFile: uploadImageByFile,
      },
    },
  },
  header: {
    class: Header,
    config: {
      placeholder: "Type Heading...",
      levels: [2, 3],
      defaultLevel: 2,
    },
  },
  quote: {
    class: Quote,
    inlineToolbar: true,
  },
  marker: Marker,
  InlineCode: InlineCode,
};
