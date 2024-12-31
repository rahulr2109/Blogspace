import React from "react";

// Utility function to decode HTML entities like &nbsp;, &lt;, etc.
const decodeHtml = (html) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
};

// Image Component
const Img = ({ url, caption }) => (
  <div>
    <img src={url} alt={caption || "Image"} />
    {caption?.length ? (
      <p className="w-full text-center my-3 md:12 text-base text-dark-grey">
        {decodeHtml(caption)}
      </p>
    ) : null}
  </div>
);

// Quote Component
const Quote = ({ quote, caption }) => {
  // Format quote to handle <br> tags
  const formatQuote = (text) =>
    text.split(/<br\s*\/?>/gi).map((line, index) => (
      <React.Fragment key={index}>
        {decodeHtml(line)}
        {index < text.split(/<br\s*\/?>/gi).length - 1 && <br />}
      </React.Fragment>
    ));

  return (
    <div className="bg-purple/10 p-3 pl-5 border-l-4 border-purple">
      <p className="text-xl leading-10 md:text-2xl">{formatQuote(quote)}</p>
      {caption?.length ? (
        <p className="w-full text-purple text-base">{decodeHtml(caption)}</p>
      ) : null}
    </div>
  );
};

// List Component
const List = ({ style, items }) => (
  <div>
    <ol
      className={`pl-5 ${
        style === "ordered" ? "list-decimal" : "list-disc"
      }`}
    >
      {items.map((listItem, index) => (
        <li key={index} className="my-4">
          {decodeHtml(listItem)}
        </li>
      ))}
    </ol>
  </div>
);

// Link Component for handling <a> tags
const Link = ({ href, text }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="text-blue-500 hover:underline"
  >
    {decodeHtml(text)}
  </a>
);

// BlogContent Component
const BlogContent = ({ block }) => {
  const { type, data } = block;

  switch (type) {
    case "paragraph":
      return (
        <p
          dangerouslySetInnerHTML={{ __html: decodeHtml(data.text) }}
        />
      );
    case "header":
      return data.level === 3 ? (
        <h3 className="text-3xl font-bold">{decodeHtml(data.text)}</h3>
      ) : (
        <h2 className="text-4xl font-bold">{decodeHtml(data.text)}</h2>
      );
    case "image":
      return <Img url={data.file.url} caption={data.caption} />;
    case "quote":
      return <Quote quote={data.text} caption={data.caption} />;
    case "list":
      return <List style={data.style} items={data.items} />;
    case "link":
      return <Link href={data.href} text={data.text} />;
    default:
      return null; // Gracefully handle unsupported block types
  }
};

export default BlogContent;
