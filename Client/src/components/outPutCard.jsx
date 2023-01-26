export default function OutPutCard(props) {
  return (
    <>
      <div className="out-put-card-ourtter">
        <div className="out-put-card-inner">
          <img
            src={props.img}
            alt="A small thumbnail picture of the product"
            className="out-put-card-img-thumbnail"
          />
          <p className="out-put-card-title">{props.title}</p>
          <em className="out-put-card-price">{props.price} DKK</em>
        </div>
      </div>
    </>
  );
}
