import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/ui/dropdown-menu";
import { EllipsisIcon, Trash2Icon } from "lucide-react";

interface TableMenuProps {
  handleDeleteAll: () => void;
  selectedBucket: string | null;
  deleting: boolean;
}

export function TableMenu({
  handleDeleteAll,
  selectedBucket,
  deleting,
}: TableMenuProps) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <EllipsisIcon className="h-4 w-4 opacity-75" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end">
        <DropdownMenuLabel>Object Actions</DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={handleDeleteAll}
            disabled={!selectedBucket || deleting}
            variant="destructive"
          >
            <Trash2Icon className="h-4 w-4" />
            Delete All
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
