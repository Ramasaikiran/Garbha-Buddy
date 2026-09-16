'use client';

export default function BookButton({
  companionId,
  companionName,
}: {
  companionId: string;
  companionName: string;
}) {
  return (
    <button
      onClick={() => {
        // Route to attendee registration, pre-filled with this companion
        window.location.href = `/client/register?companionId=${companionId}`;
      }}
      className="mt-6 w-full rounded-xl bg-[#ffb703] py-3 font-semibold text-[#1a0b2e] transition hover:bg-[#ffc93c]"
    >
      Book {companionName}
    </button>
  );
}
