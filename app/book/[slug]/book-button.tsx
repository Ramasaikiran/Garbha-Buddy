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
        window.location.href = `/client/register?companionId=${companionId}`;
      }}
      className="btn-primary mt-6 w-full"
    >
      Book {companionName}
    </button>
  );
}
