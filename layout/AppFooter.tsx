/* eslint-disable @next/next/no-img-element */

import Image from "next/image";

const AppFooter = () => {
  return (
    <div className="layout-footer">
      <Image
        src="/assets/image_login.jpg"
        alt="Logo"
        width={20}
        height={20}
        priority
        className="mr-2"
      />
      <span className="font-medium ml-2">GA Soluções Empresariais</span>
    </div>
  );
};

export default AppFooter;
