interface ProductCardProps {
  product: {
    id: number;
    title: string;
    image: string;
    price: string;
    discountedPrice: string;
    isSales: boolean;
    sales: {
      name: string;
      color: string;
    };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="relative w-45 h-47 shrink-0 bg-white dark:bg-background border border-border pt-1.5 px-1.5 pb-2 rounded-xl overflow-hidden">
      {product.isSales && (
        <div
          className="absolute top-2 left-2 text-xxs text-white rounded-[40px] py-0.5 px-2"
          style={{ background: product.sales?.color ?? "var(--background)" }}
        >
          {product.sales?.name}
        </div>
      )}

      <img
        src={product.image}
        alt="product"
        className="w-full h-29 object-cover object-center rounded-t-md mb-1"
      />

      <div className="space-y-1">
        <p className="text-xs font-medium truncate">
          Wall Mounted 6u Rack - 600 X 450
        </p>

        <div className="flex items-center gap-[3px]">
          <img src="/assets/icons/star-filled.svg" alt="star" />
          <p className="text-xxs text-secondary">4.7(188)</p>
        </div>

        <div className="flex items-center gap-1">
          <p className="text-xxs text-success">$58,000</p>
          <p className="text-xxs text-disabled line-through">$90,845</p>
        </div>
      </div>
    </div>
  );
}
