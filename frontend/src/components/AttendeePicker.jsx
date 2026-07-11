import { useEffect, useRef, useState } from "react";
import { useUserSearch } from "../hooks/useUsers";

// Ô tìm + chọn nhiều người dùng thật (debounce gọi GET /users?q=), dùng chung cho
// modal tạo cuộc họp và modal đặt phòng.
export function AttendeePicker({ value, onChange, placeholder = "Thêm người..." }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: results = [], isFetching } = useUserSearch(open ? debouncedQuery : undefined);

  useEffect(() => {
    function onClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const selectedIds = new Set(value.map((u) => u.id));
  const filteredResults = results.filter((u) => !selectedIds.has(u.id));

  function addUser(user) {
    onChange([...value, user]);
    setQuery("");
  }

  function removeUser(id) {
    onChange(value.filter((u) => u.id !== id));
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-neutral-200 px-2 py-2">
        {value.map((u) => (
          <span
            key={u.id}
            className="inline-flex items-center gap-1 rounded-full bg-[#d6f0df] px-2 py-1 text-xs text-[#0f5132]"
          >
            <span className="grid h-4 w-4 place-items-center rounded-full bg-[#22b573] text-[10px] text-white">
              {u.name?.[0]?.toUpperCase()}
            </span>
            {u.name}
            <button type="button" onClick={() => removeUser(u.id)} className="ml-1 text-neutral-500">
              ×
            </button>
          </span>
        ))}
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={placeholder}
          className="min-w-[100px] flex-1 text-sm outline-none"
        />
      </div>
      {open && (
        <div className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-neutral-200 bg-white shadow-lg">
          {isFetching && <div className="px-3 py-2 text-xs text-neutral-400">Đang tìm...</div>}
          {!isFetching && filteredResults.length === 0 && (
            <div className="px-3 py-2 text-xs text-neutral-400">Không tìm thấy người dùng nào</div>
          )}
          {filteredResults.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => addUser(u)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-neutral-50"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-neutral-200 text-[10px] font-semibold text-neutral-700">
                {u.name?.[0]?.toUpperCase()}
              </span>
              <span>
                <span className="block text-neutral-900">{u.name}</span>
                <span className="block text-xs text-neutral-400">{u.position || u.email}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
