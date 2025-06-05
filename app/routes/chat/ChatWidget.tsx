import { useState } from "react";
import { Text } from "@shopify/polaris";
import ProductCard from "./ProductCard";
import data from "~/data.json";
import Chip from "./Chip";
import Coupon from "./Coupon";

export default function ChatWidget() {
  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState<string[]>([]);

  const handleSend = () => {
    if (message.trim()) {
      setChatLog([...chatLog, message]);
      setMessage("");
    }
  };

  return (
    <section className="relative flex flex-col pb-14">
      <div className="h-[459px] overflow-y-auto">
        {/** Abandoned cart */}
        <div>
          <div className="inline-flex items-center gap-2 bg-danger-100 text-danger text-xxs font-bold rounded-[38px] px-2 py-1">
            <img src="/assets/icons/stars.svg" alt="stars" />
            Abandoned cart
          </div>

          {chatLog.map((msg, idx) => (
            <Text as="p" key={idx}>
              {msg}
            </Text>
          ))}

          <Text as="p">
            <p className="text-sm mb-2">
              Great choice! It looks like you haven’t checked out yet. You can
              checkout by clicking the 'Buy Now' button below.
            </p>
          </Text>

          <div className="flex gap-2 overflow-x-auto snap-mandatory snap-x no-scrollbarx mb-2">
            {data.carts.map((cart) => (
              <ProductCard key={cart.id} product={cart} />
            ))}
          </div>

          <div className="flex gap-2 mb-2">
            <button className="flex-1 bg-white dark:bg-background text-foreground h-12 border border-container rounded-xl">
              Buy Now
            </button>

            <button className="bg-white dark:bg-background w-14 h-12 grid place-content-center border border-container rounded-xl">
              <img
                src="/assets/icons/more.svg"
                className="block dark:hidden"
                alt="more"
              />
              <img
                src="assets/icons/more-dark.svg"
                className="hidden dark:block"
                alt="more"
              />
            </button>
          </div>
        </div>

        {/** Deals for you */}
        <div>
          <div className="inline-flex items-center gap-2 bg-success-100 text-success text-xxs font-bold rounded-[38px] px-2 py-1">
            <img src="/assets/icons/stars-success.svg" alt="stars" />
            Deals for you
          </div>

          <p className="text-sm mb-2">
            Deals automatically generated for you. Don’t miss out.
          </p>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-2">
            {data.sales.map((sale) => (
              <Chip key={sale.id} {...sale} />
            ))}
          </div>

          <div className="flex items-center gap-4 overflow-x-auto no-scrollbarx mb-2">
            {data.coupons.map((deal) => (
              <Coupon key={deal.id} coupon={deal} />
            ))}
          </div>

          <div className="flex gap-2 overflow-x-auto snap-mandatory snap-x no-scrollbar mb-2">
            {data.deals.map((deal) => (
              <ProductCard key={deal.id} product={deal} />
            ))}
          </div>

          <p className="text-sm mb-2">
            Still looking for the right item? Click view more to explore more
            affordable deals and promotional offers!
          </p>

          <button className="h-10 flex items-center justify-center gap-[5px] bg-white dark:bg-background text-primary border border-container rounded-xl px-13 py-3">
            <img src="/assets/icons/stars-primary.svg" alt="stars" />

            <span className="text-sm">View more</span>
          </button>
        </div>
      </div>

      <div className="h-12 bg-white absolute inset-x-0 bottom-0 rounded-4xl">
        <div className="w-full h-full flex items-center gap-4 px-3 py-2">
          <img src="/assets/icons/logo-sm.svg" alt="logo" />

          <input
            type="text"
            placeholder="Chat to shop"
            className="flex-1 bg-white dark:bg-background dark:placeholder-foreground py-2 px-2.5 rounded-[10px]"
          />

          <button onClick={handleSend}>
            <img src="/assets/icons/microphone.svg" alt="microphone" />
          </button>
        </div>
      </div>
    </section>
  );
}
