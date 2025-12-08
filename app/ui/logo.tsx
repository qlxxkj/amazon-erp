import { lusitana } from '@/app/ui/fonts';
import Image from 'next/image';

export default function Logo() {
  return (
    <div
          className={`${lusitana.className} flex flex-row items-center  whitespace-nowrap leading-none text-blue-600 `}
    >
          <Image
            src="/ant-logo.png"
            width={48}
            height={48}
            alt='logo'
              className="hidden md:block mr-1 md:mr-3"
          />
          <Image
              src="/ant-logo.png"
              width={24}
              height={24}
              alt='logo'
              className="block md:hidden mr-1"
          />
          <p className="text-[24px]">QLING ERP</p>
    </div>
  );
}
