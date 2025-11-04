import { useContext, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import "./Header.css";
import { CountriesContext } from "../CountriesContext";

export function Header() {
  const { allCountries, setCountries, favorites } =
    useContext(CountriesContext);
  const [search, setSearch] = useState("");
  const location = useLocation();

  const pathnameToRegion = {
    "/Africa": "Africa",
    "/Asia": "Asia",
    "/Europe": "Europe",
    "/Oceania": "Oceania",
    "/TheAmericas": "Americas",
  };

  const currentRegion = pathnameToRegion[location.pathname] || null;

  const handleLogoClick = () => {
    setSearch("");
    setCountries(
      currentRegion
        ? allCountries.filter((c) => c.region === currentRegion)
        : [...allCountries]
    );
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);

    if (!value.trim()) {
      setCountries(
        currentRegion
          ? allCountries.filter((c) => c.region === currentRegion)
          : [...allCountries]
      );
      return;
    }

    const filtered = allCountries.filter((c) => {
      const name = c.name?.common?.toLowerCase() || "";
      const region = c.region?.toLowerCase() || "";
      const subregion = c.subregion?.toLowerCase() || "";
      const capital = c.capital?.join(", ").toLowerCase() || "";
      const callingCode =
        (c.idd?.root || "") + (c.idd?.suffixes ? c.idd.suffixes.join("") : "");

      const matchesSearch =
        name.includes(value) ||
        region.includes(value) ||
        subregion.includes(value) ||
        capital.includes(value) ||
        callingCode.includes(value);

      if (currentRegion) {
        return matchesSearch && c.region === currentRegion;
      }

      return matchesSearch;
    });

    setCountries(filtered);
  };

  return (
    <div className="header">
      <div className="header-top">
        <Link to="/" onClick={handleLogoClick}>
          <img src="globe.png" alt="globe icon" className="logo" width={30} />
        </Link>

        <form onSubmit={(e) => e.preventDefault()}>
          <input
            type="search"
            placeholder="Search for country, region, or capital..."
            value={search}
            onChange={handleSearch}
          />
        </form>

        <Link to="/Favorites" className="favorite-btn">
          <img
            src="heart-filled.png"
            alt="favorite icon"
            className="favoriteIcon"
            width={20}
          />
          Favorites ({favorites.length})
        </Link>
      </div>

      <div className="navbar">
        <Link to="/Africa" className="region">
          Africa
        </Link>
        <Link to="/TheAmericas" className="region">
          The Americas
        </Link>
        <Link to="/Asia" className="region">
          Asia
        </Link>
        <Link to="/Europe" className="region">
          Europe
        </Link>
        <Link to="/Oceania" className="region">
          Oceania
        </Link>
      </div>
    </div>
  );
}
