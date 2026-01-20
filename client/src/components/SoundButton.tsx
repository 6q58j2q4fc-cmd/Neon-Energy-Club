import { Button } from "@/components/ui/button";
import { useSoundEffects, SoundType } from "@/hooks/useSoundEffects";
import { forwardRef, ComponentPropsWithoutRef, MouseEvent } from "react";

interface SoundButtonProps extends ComponentPropsWithoutRef<typeof Button> {
  soundType?: SoundType;
}

const SoundButton = forwardRef<HTMLButtonElement, SoundButtonProps>(
  ({ soundType = "click", onClick, children, ...props }, ref) => {
    const { playSound } = useSoundEffects();

    const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
      playSound(soundType);
      onClick?.(e);
    };

    return (
      <Button ref={ref} onClick={handleClick} {...props}>
        {children}
      </Button>
    );
  }
);

SoundButton.displayName = "SoundButton";

export default SoundButton;
