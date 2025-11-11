'use client';

type Props = {
  onClick: () => void;
};

export default function CenterButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 rounded-full bg-[#00FFF6] text-black font-semibold px-4 py-2 shadow-lg hover:bg-cyan-400 transition"
      title="Center on my location"
    >
      📍 Center on Me
    </button>
  );
}
