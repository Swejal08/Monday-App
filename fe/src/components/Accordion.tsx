import {
  Accordion as AccordionBar,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface AccordionProps {
  title: string;
  value: string;
  children: React.ReactNode;
  isFetching: boolean;
  loadingComponent: React.ReactNode;
  isEmpty: boolean;
  emptyComponent: React.ReactNode;
}

const Accordion = ({
  title,
  value,
  children,
  isFetching,
  loadingComponent,
  isEmpty,
  emptyComponent,
}: AccordionProps) => {
  return (
    <AccordionBar
      type="single"
      collapsible
      defaultValue={value}
      className="w-[400px]"
    >
      <AccordionItem value={value}>
        <AccordionTrigger className="justify-center">{title}</AccordionTrigger>
        <AccordionContent>
          {isFetching ? loadingComponent : isEmpty ? emptyComponent : children}
        </AccordionContent>
      </AccordionItem>
    </AccordionBar>
  );
};

export default Accordion;
