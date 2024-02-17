const Img = ({ url, caption }) => {
  return (
    <div>
      <img src={url} />
      {caption.length ? (
        <p className="w-full text-center my-3 md:12 text-base text-dark-grey">
          {caption}
        </p>
      ) : (
        ""
      )}
    </div>
  );
};

const Quote = ({ quote, caption }) => {
  return (
    <div className="bg-purple/10 p-3 pl-5 border-l-4 border-purple">
      <p className="text-xl leading-10 md:text-2xl">{quote}</p>
      {caption.length ? (
        <p className="w-full text-purple text-base">{caption}</p>
      ) : (
        ""
      )}
    </div>
  );
};

const List = ({ style, items }) => {
  return (
    <div>
      <ol
        className={`pl-5 ${
          style == "ordered" ? " list-decimal" : " list-disc"
        }`}
      >
        {items.map((listItem, index) => {
          return (
            <li key={index} className="my-4">
              {listItem}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

const BlogContent = ({ block }) => {
  let { type, data } = block;

  if (type == "paragraph") {
    return <p>{data.text}</p>;
  }

  if (type == "header") {
    if (data.level == 3) {
      return <h3 className="text-3xl font-bold">{data.text}</h3>;
    }
    return <h2 className="text-4xl font-bold">{data.text}</h2>;
  }

  if (type == "image") {
    return <Img url={data.file.url} caption={data.caption} />;
  }

  if (type == "quote") {
    return <Quote quote={data.text} caption={data.caption} />;
  }
  if (type == "list") {
    return <List style={data.style} items={data.items} />;
  }
};
export default BlogContent;

//dangerouslySetInnerHTML={{ __html: data.text }}
