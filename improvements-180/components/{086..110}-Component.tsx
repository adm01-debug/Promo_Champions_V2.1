import { FC } from 'react';

interface ComponentProps {
  data?: any;
}

export const Component: FC<ComponentProps> = ({ data }) => {
  return <div className="p-4">{JSON.stringify(data)}</div>;
};
