import Button from "./Button";

interface IncrementalInputProps {
  onIncrement: () => void;
  onDecrement: () => void;
  title: string;
  value: string;
}

const IncrementalInput = ({
  title,
  value,
  onIncrement,
  onDecrement,
}: IncrementalInputProps) => {
  return (
    <div className="flex flex-row gap-4 items-center">
      <Button className="w-20 text-5xl" onClick={() => onDecrement()}>
        -
      </Button>
      <div className="flex flex-col items-center w-20">
        <h3>{title}</h3>
        <h2>{value}</h2>
      </div>
      <Button className="w-20 text-5xl" onClick={() => onIncrement()}>
        +
      </Button>
    </div>
  );
};

export default IncrementalInput;
