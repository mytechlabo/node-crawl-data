const cheerio = require("cheerio");
const request = require("request");
const rp = require("request-promise");
const fs = require("fs");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Lưu danh sách link thành mảng
const linkPath = "black-link.txt";
var arrayLink = fs.readFileSync(linkPath).toString().split("\n");

async function crawler() {
  await sleep(1000);

  for (i in arrayLink) {
    const linkPath = arrayLink[i];

    try {
      const options = {
        uri: linkPath,
        transform: function (body) {
          // Khi lấy dữ liệu từ trang thành công nó sẽ tự động parse DOM
          return cheerio.load(body);
        },
      };
      var $ = await rp(options);
    } catch (error) {
      console.log("Đường dẫn không hợp lệ:" + arrayLink[i]);
      return error;
    }

    // Lấy tên bài viết
    const title = $(".ten_title").text().trim();
    // const description = $(".entry-content > p").text().trim();

    // Kiếm class hoặc id cha chứa nội dung website
    const tableContent = $(".info_content");
    let data = [];

    // Tên của chương đó
    let chaperTitle = tableContent.find("p").text().trim();

    // Tìm hình ảnh trong bài viết
    let namefile = "";
    let chaperData = [];
    const chaperLink = tableContent.find("p").find("img");

    for (let j = 0; j < chaperLink.length; j++) {
      const post = $(chaperLink[j]);
      const postLink = post.attr("src");

      // Lấy vị trí thứ tự để chúng ta biết mà cắt lấy name của hình ảnh
      const n = postLink.lastIndexOf("/");

      // Lấy name hình ảnh
      const filename = postLink.substring(n + 1, postLink.length);
      namefile = filename;

      // Tiến hành chèn url hình và name hình vào hàm download
      download(postLink, filename, function () {
        // console.log("Link: " + link);
      });
      const postTitle = post.text().trim();

      chaperData.push({
        postTitle,
        linkPath,
        filename,
      });
    }

    data.push({
      chaperTitle,
      chaperData,
    });

    // Lưu dữ liệu về máy
    fs.writeFileSync("data/data.json", JSON.stringify(data));
    console.log(linkPath + " ----------> done");

    await sleep(1000);
  }
}
//call crawler
crawler();

//call download file
var download = function (uri, filename, callback) {
  request.head(uri, function (err, res, body) {
    console.log("content-type:", res.headers["content-type"]);
    console.log("content-length:", res.headers["content-length"]);

    request(uri)
      .pipe(fs.createWriteStream("./images/" + filename))
      .on("close", callback);
  });
};
