import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';

interface PaginationBarProps {
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
}

const PaginationBar = ({ page, totalPages, setPage }: PaginationBarProps) => {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={() => {
              setPage(page - 1);
            }}
          />
        </PaginationItem>
        {page > 1 && (
          <PaginationItem>
            <PaginationLink href="#" onClick={() => setPage(page - 1)}>
              {page - 1}
            </PaginationLink>
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationLink
            href="#"
            onClick={() => setPage(page)}
            isActive={true}
          >
            {page}
          </PaginationLink>
        </PaginationItem>
        {page < totalPages && (
          <PaginationItem>
            <PaginationLink href="#" onClick={() => setPage(page + 1)}>
              {page + 1}
            </PaginationLink>
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={() => {
              if (page < totalPages) {
                setPage(page + 1);
              }
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

export default PaginationBar;
