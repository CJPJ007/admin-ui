import { TeamMember } from "@/utils/interfaces";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "./ui/card";

// Sortable Card Wrapper
export function SortableTeamCard({ member, children }: { member: TeamMember; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: member.id });

    const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style}>
     {/* <div > */}
      {/* Drag handle on image */}
      <div {...attributes} {...listeners} className="cursor-move">
        {children.props.children[0]} {/* Image container */}
      </div>
      {/* Rest of card content */}
      <div>{children.props.children.slice(1)}</div>
    {/* </div> */}
    </Card>
  );
}
