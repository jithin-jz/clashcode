import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="top-center"
      richColors
      closeButton
      visibleToasts={3}
      expand
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:rounded-lg group-[.toaster]:border group-[.toaster]:border-[#262626] group-[.toaster]:bg-[#141414] group-[.toaster]:p-4 group-[.toaster]:text-neutral-200",
          description: "group-[.toast]:text-xs group-[.toast]:text-neutral-500",
          actionButton: "group-[.toast]:bg-white group-[.toast]:text-[#0a0a0a]",
          cancelButton:
            "group-[.toast]:bg-[#1a1a1a] group-[.toast]:text-neutral-400",
          success:
            "group-[.toaster]:border-emerald-800 group-[.toaster]:bg-emerald-950/50",
          error:
            "group-[.toaster]:border-red-800 group-[.toaster]:bg-red-950/50",
          warning:
            "group-[.toaster]:border-amber-800 group-[.toaster]:bg-amber-950/50",
          info: "group-[.toaster]:border-sky-800 group-[.toaster]:bg-sky-950/50",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
