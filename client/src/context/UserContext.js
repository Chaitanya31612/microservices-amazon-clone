import axios from "axios";

const { createContext, useState, useContext, useEffect } = require("react");

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchUser() {
      setLoading(true);
      try {
        const { data } = await axios.get("/api/current-user");

        setCurrentUser(data?.currentUser || null);
      } catch (error) {
        console.error("Error fetching current user:", error);
        setCurrentUser(null);
      } finally {
        // setLoading(false);
      }
    }

    fetchUser();
  }, []);

  const userSignedOut = () => {
    setCurrentUser(null);
  };

  return (
    <UserContext.Provider
      value={{ currentUser, setCurrentUser, userSignedOut }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
