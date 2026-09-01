import CategoriesBar from "./CategoriesBar";
import { MainHeader } from "./main-header";
import { TopBar } from "./top-bar";

const Header = () => {
  return (
    <>
      <TopBar />

      <MainHeader>
        <CategoriesBar />
      </MainHeader>
    </>
  );
};

export default Header;
