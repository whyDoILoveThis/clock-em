import { BsThreeDotsVertical } from "react-icons/bs";

interface Props {
  size?: number;
}

const IconThreeDots = ({ size = 20 }: Props) => {
  return <BsThreeDotsVertical size={size} />;
};

export default IconThreeDots;
