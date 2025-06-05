interface CouponProps {
  coupon: {
    id: string | number;
    title: string;
    discount: string;
    expirationDate: string;
    code: string;
    image: string;
    isUsed: boolean;
  };
}

export default function Coupon({ coupon }: CouponProps) {
  return (
    <div className="relative shrink-0 w-44 h-25 flex items-center bg-white rounded-lg before:absolute before:w-[22px] before:h-[22px] before:bg-[#F1F1F1] before:top-1/2 before:-translate-y-1/2 before:-left-[11px] before:rounded-full after:absolute after:w-[22px] after:h-[22px] after:bg-[#F1F1F1] after:top-1/2 after:-translate-y-1/2 after:-right-[11px] after:rounded-full overflow-hidden">
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
