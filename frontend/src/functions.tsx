export const isUserLoggedIn = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/auth/users/me/", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
      });
  
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  export const sendUserBackToLoginPageIfNotLoggedIn = async () => {
    const loggedIn = await isUserLoggedIn();
    if (!loggedIn) {
      window.location.replace("/login");
    }
  };

  export const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    let interval = Math.floor(seconds / 31536000);
    if (interval > 50) {
      return "Never";
    }
    if (interval >= 1) {
      return interval + " years ago";
    }
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return interval + " months ago";
    }
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return interval + " days ago";
    }
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return interval + " hours ago";
    }
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return interval + " minutes ago";
    }
    return Math.floor(seconds) + " seconds ago";
  };

  export const shuffle = (array: any[]) => { 
    for (let i = array.length - 1; i > 0; i--) { 
      const j = Math.floor(Math.random() * (i + 1)); 
      [array[i], array[j]] = [array[j], array[i]]; 
    } 
    return array; 
  }; 


export function trackActivity() {
  const startTime = new Date();
  const sendActivityData = () => {
      const endTime = new Date();
      const durationSeconds = (endTime.getTime() - startTime.getTime()) / 1000;

      fetch('http://127.0.0.1:8000/api/activity', {
          method: 'POST',
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ seconds: durationSeconds })
      }).then(() => {
          console.log('Dane aktywności zostały wysłane.');
      }).catch((error) => {
          console.error('Błąd podczas wysyłania danych aktywności:', error);
      });
  };
  window.addEventListener('beforeunload', (event) => {
      //event.preventDefault();
      sendActivityData();
      delete event['returnValue'];
      //return '';
  });

  window.addEventListener('unload', () => {
      sendActivityData();
  });
};

export function formatDateWithoutTime(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Miesiące są indeksowane od 0
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function daysInMonth (month: number, year: number) {
  return new Date(year, month + 1, 0).getDate();
};

export function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height
  };
};

export function getFormattedDate(date: Date) {
  // Uzyskaj rok, miesiąc i dzień z obiektu Date
  let rok = date.getFullYear().toString();
  let miesiac = (date.getMonth() + 1).toString(); // Miesiące są liczone od 0 (styczeń) do 11 (grudzień)
  let dzien = date.getDate().toString();

  // Dodaj wiodące zera do miesięcy i dni, jeśli to konieczne
  if (parseInt(miesiac) < 10) {
      miesiac = '0' + miesiac;
  }
  if (parseInt(dzien) < 10) {
      dzien = '0' + dzien;
  }

  // Zbuduj datę w formacie yyyy-mm-dd
  let dataFormatowana = rok + '-' + miesiac + '-' + dzien;
  return dataFormatowana;
};

export function getColorForSubject(id: number) {
  const colors = [
    "#49afad",
    "#7bcef1",
    "#006666",
    "#00bb00",
    "#694489",
    "#eac553"
  ];

  return colors[id % colors.length];

};