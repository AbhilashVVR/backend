const formidable = require('formidable');
const {
  registerNewGame,
  getGames,
  getGamesByName,
  getGameWithId,
  editGameById,
  deleteGame,
} = require("../dynamodb/database/game");

const { uploadApp } = require("./s3bucket")

const RegisterNewGame = async (req, res) => {

  var form = await new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    try {
      // ADD S3 Bucket for files
      var urlLink = '';
      const gameDetail = JSON.parse(fields.data);
      console.log(gameDetail);
      if (gameDetail.appType !== 'html5') {
        console.log(files.file_path)
        if (files.file_path) {
          urlLink = await uploadApp(files.file_path);

          const gameDetails = JSON.parse(fields.data)

          const game = await registerNewGame({
            gameName: gameDetails.gameName,
            gameDescription: gameDetails.gameDescription,
            gameIcon: gameDetails.gameIcon,
            //gameBanner: gameBanner,
            createdAt: gameDetails.createdAt,
            isEnabled: true,
            gameStatus: 'Active',
            gameType: gameDetails.gameType,
            singlePlayer: gameDetails.singlePlayer,
            multiPlayer: gameDetails.multiPlayer,
            dailyCompetition: gameDetails.dailyCompetition,
            website: gameDetails.website,
            packageName: gameDetails.packageName,
            actionName: gameDetails.actionName,
            fileSize: files.file_path.size,
            // newType: gameDetails.newType || null,
            // featuredType: gameDetails.featuredType || null,
            appType: gameDetails.appType,
            apkLink: urlLink,
            gameVersion: gameDetails.gameVersion,
            html5Link: gameDetails.html5Link,

          });

          console.log('game', game);
          res.json(game);
        }
        else {
          res.json({
            gameType : gameDetails.gameType,
            error: 'Apk File not uploaded'
          });
        }
      }
      else {
        const gameDetails = JSON.parse(fields.data)
        console.log(gameDetails)

        const game = await registerNewGame({
          gameName: gameDetails.gameName,
          gameDescription: gameDetails.gameDescription,
          gameIcon: gameDetails.gameIcon,
          //gameBanner: gameBanner,
          createdAt: gameDetails.createdAt,
          isEnabled: true,
          gameStatus: 'Active',
          gameType: gameDetails.gameType,
          singlePlayer: gameDetails.singlePlayer,
          multiPlayer: gameDetails.multiPlayer,
          dailyCompetition: gameDetails.dailyCompetition,
          website: gameDetails.website,
          fileSize: 1,
          // newType: gameDetails.newType || null,
          // featuredType: gameDetails.featuredType || null,
          appType: gameDetails.appType,
          apkLink: urlLink,
          gameVersion: gameDetails.gameVersion,
          html5Link: gameDetails.html5Link,

        });
        res.json(game);
      }
    } catch (err) {
      res.json({ message: err });
    }
  })
};

const GetGames = async (req, res) => {
  try {
    const games = await getGames();
    res.json(games.Items);
  } catch (err) {
    res.json({ message: err });
  }
}

const GetGameWithId = async (req, res) => {
  try {
    let data = await getGameWithId(req.params.id);
    res.json(data);
  } catch (err) {
    res.json({ message: err });
  }
};

const GetGameByGameName = async (req, res) => {
  try {
    const gamesByName = await getGamesByName(req.params.name);
    res.json(gamesByName.Items);
  } catch (err) {
    res.json({ message: err });
  }
}

const EnableDisableGame = async (req, res) => {
  const previousGame = await getGameWithId(req.params.id);

  if (!previousGame) {
    return res.json({ message: "Game Not Found" });
  }
  const gameStatus = (!previousGame.enable) ? "Active" : "InActive";
  await editGameById(previousGame, {
    gameStatus: gameStatus,
    isEnabled: !previousGame.isEnabled,
    singlePlayer: previousGame.singlePlayer,
    multiPlayer: previousGame.multiPlayer,
    website: previousGame.website,
    dailyCompetition: previousGame.dailyCompetition,

  });

  const updatedGame = await getGameWithId(req.params.id);
  res.json(updatedGame);
};

const EditGameById = async (req, res) => {
  try {
    const previousGame = await getGameWithId(req.params.id);

    console.log(previousGame);

    if (previousGame) {
      var form = await new formidable.IncomingForm();
      form.parse(req, async (err, fields, files) => {
        try {
          // ADD S3 Bucket for files
          var urlLink = ''
          if (files.file_path) {
            console.log('test3');
            urlLink = await uploadApp(files.file_path);
            console.log(urlLink);

            const gameDetails = JSON.parse(fields.data)

            console.log(gameDetails);

            await editGameById(previousGame, {
              gameStatus: previousGame.gameStatus,
              isEnabled: previousGame.isEnabled,
              gameName: gameDetails.gameName,
              gameDescription: gameDetails.gameDescription,
              gameIcon: gameDetails.gameIcon,
              gameType: gameDetails.gameType,
              singlePlayer: gameDetails.singlePlayer,
              multiPlayer: gameDetails.multiPlayer,
              website: gameDetails.website,
              dailyCompetition: gameDetails.dailyCompetition,
              createdAt: gameDetails.createdAt,
              fileSize: files.file_path.size,
              appType: previousGame.appType,
              apkLink: urlLink,
              gameVersion: gameDetails.gameVersion,
              html5Link: gameDetails.html5url,

            });
            const updatedGame = await getGameWithId(req.params.id);
            res.json(updatedGame);
          }
          else {

            console.log('test');

            const gameDetails = JSON.parse(fields.data)

            console.log(gameDetails);

            await editGameById(previousGame, {
              gameStatus: previousGame.gameStatus,
              isEnabled: previousGame.isEnabled,
              gameName: gameDetails.gameName,
              gameDescription: gameDetails.gameDescription,
              gameIcon: gameDetails.gameIcon,
              gameType: gameDetails.gameType,
              singlePlayer: gameDetails.singlePlayer,
              multiPlayer: gameDetails.multiPlayer,
              website: gameDetails.website,
              dailyCompetition: gameDetails.dailyCompetition,
              fileSize: 1,
              createdAt: gameDetails.createdAt,
              appType: previousGame.appType,
              apkLink: gameDetails.apkLink,
              gameVersion: gameDetails.gameVersion,
              html5Link: gameDetails.html5url,

            });
            const updatedGame = await getGameWithId(req.params.id);
            res.json(updatedGame);
          }
        } catch (err) {
          res.json({ message: err });
        }
      })
    }
  } catch (err) {
    res.json({ message: err });
  }
}

const DeleteGame = async (req, res) => {
  try {
    const deleteCat = await deleteGame(req.params.id)
    res.json(deleteCat);
  } catch (err) {
    res.json({ message: err });
  }
}

module.exports = {
  RegisterNewGame,
  GetGames,
  GetGameByGameName,
  GetGameWithId,
  EnableDisableGame,
  EditGameById,
  DeleteGame
};
