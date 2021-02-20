// file lazy loading

const uploadedPicturesRow = document.querySelector('.uploadedPicturesRow');
const loader = document.querySelector('.loader');

const getPictures = async (number) => {
    const API_URL = `/data?start=${number}&end=${number+2}`;
    await fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            console.log(data);
            showPictures(data);
            return data;
        })
        .catch((reject) => {console.log(reject)});
}

const showPictures = (pictures) => {
    console.log("again", pictures);
    pictures.forEach(picture => {
        const pictureContainer = document.createElement('div');
        pictureContainer.classList.add('col-lg-3');
        pictureContainer.innerHTML = `
            <div class="pictureContainer" >
                <img src="${picture.image}" alt="" >
            </div>
            <div class="pictureDescription" >
                <h5>${picture.name}</h5>
                <p>${picture.description}</p>
            </div>
        `;

        uploadedPicturesRow.appendChild(pictureContainer);
    });
};

const hideLoader = () => {
    loader.classList.add('hide');
};

const showLoader = () => {
    loader.classList.remove('hide');
};

let number = 0;
let picturesContent;
let total = 0;
let count = 0;
let page = 0;

let hasMorePictures = true;

const loadPictures = async (number) => {

    // show the loader
    if(hasMorePictures) {
        showLoader();
    }

    // 0.5 second later
    setTimeout(async () => {
        try {
            // if having more pictures to fetch
            if (hasMorePictures) {
                // call the API to get pictures
                let response = await getPictures(number);
                if(response === []) {
                    hasMorePictures = false;
                }
                // show pictures
                showPictures(response);
                // update the total
                total = total;
            }
        } catch (error) {
            console.log(error.message);
        } finally {
            hideLoader();
        }
    }, 500);

};

window.addEventListener('scroll', () => {
    const {
        scrollTop,
        scrollHeight,
        clientHeight
    } = document.documentElement;

    if (scrollTop + clientHeight >= scrollHeight - 5 &&
        hasMorePictures) {
        number += 2;
        loadPictures(number);
    }
}, {
    passive: true
});

loadPictures(number);
