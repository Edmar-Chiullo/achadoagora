import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  defaultValue?: string;
  placeholder?: string;
}

function SearchBar({
  defaultValue = "",
  placeholder = "Buscar produtos, ofertas, cursos…",
}: SearchBarProps) {
  return (
    <form action="/buscar" className="flex w-full max-w-xl gap-2">
      <label htmlFor="search" className="sr-only">
        Buscar produtos
      </label>
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="search"
          name="q"
          type="search"
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="h-11 rounded-full pl-9"
        />
      </div>
      <Button type="submit" className="h-11 rounded-full px-6">
        Buscar
      </Button>
    </form>
  );
}

export { SearchBar };
