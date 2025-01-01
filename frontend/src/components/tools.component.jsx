import Embed from "@editorjs/embed";
import List from "@editorjs/list";
import Image from "@editorjs/image";
import Header from "@editorjs/header";
import Quote from "@editorjs/quote";
import Marker from '@editorjs/marker';
import InlineCode from "@editorjs/inline-code";
import Link from "@editorjs/link"; 


const uploadImageByUrl = async (url) => {
  try {
    return {
      success: 1,
      file: { url },
    };
  } catch (error) {
    console.error("Error uploading image by URL:", error);
    return {
      success: 0,
      message: "Failed to upload image by URL",
    };
  }
};

 export const uploadImageByFile = async (file) => {
  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", "blogging app");
  data.append("cloud_name", "dccadxaam");

  try {
    const response = await fetch(
      "https://api.cloudinary.com/v1_1/dccadxaam/image/upload",
      {
        method: "POST",
        body: data,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload image to Cloudinary");
    }

    const result = await response.json();
    const url = result.url.toString();

    return {
      success: 1,
      file: { url },
    };
  } catch (error) {
    console.error("Error uploading image by file:", error);
    return {
      success: 0,
      message: "Failed to upload image by file",
    };
  }
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
  inlineCode: InlineCode,
  
  // Link tool added
  link: {
    class: Link,
    inlineToolbar: true,
  },
};

