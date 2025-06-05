interface CouponProps {
  coupon: {
    id: number;
    title: string;
    discount: string;
    expirationDate: string;
    code: string;
    image: string;
    isUsed: boolean;
  };
}

export default function CouponCard({ coupon }: CouponProps) {
  return (
    <div className="coupon-box overflow-hidden">
      <div className="self-stretch w-11 grid place-content-center border-l border-dashed text-foreground dark:text-background writing-vertical-rl rotate-180">
        COUPON
      </div>

      <div className="flex-1 grid place-content-center text-foreground dark:text-background">
        <div className="flex flex-col items-center">
          <p className="text-xl font-medium uppercase">{coupon.discount} OFF</p>
          <p className="text-xxs font-semibold capitalize">{coupon.title}</p>
        </div>
      </div>
    </div>
  );
}
