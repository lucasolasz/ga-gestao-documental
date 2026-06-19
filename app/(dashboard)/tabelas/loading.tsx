// app/(dashboard)/tabelas/loading.tsx

import { Skeleton } from "primereact/skeleton";

export default function Loading() {
  return (
    <div>
      <Skeleton width="15rem" height="2rem" className="mb-4" />

      {Array.from({ length: 10 }).map((_, index) => (
        <div key={index} className="mb-2">
          <Skeleton height="2.5rem" />
        </div>
      ))}
    </div>
  );
}
