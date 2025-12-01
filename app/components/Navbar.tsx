import { Link } from "react-router";
import { MagnetizeButton } from "~/components/ui/magnetize-button";

const Navbar = () => {
    return (
        <nav className="navbar">
            <Link to="/">
                <p className="text-2xl font-bold text-gradient">GOODLUCK</p>
            </Link>

            <Link to="/upload">
                <MagnetizeButton className="bg-indigo-600 hover:bg-indigo-700 text-white border-none">
                    Upload Resume
                </MagnetizeButton>
            </Link>
        </nav>
    )
}
export default Navbar
