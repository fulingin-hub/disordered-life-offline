(function (LG) {
  const aliases = {
    "female-b/ciyun-final-3f2ef457.mp3":
      "female-b/agnes-final-3f2ef457.mp3",
    "female-b/qinghe-final-3f2ef457.mp3":
      "female-b/agnes-final-3f2ef457.mp3",
    "female-b/ciyun-normal-a901a2b3.mp3":
      "female-b/agnes-normal-a901a2b3.mp3",
    "female-b/ciyun-privacy-debebe27.mp3":
      "female-b/agnes-privacy-debebe27.mp3",
    "female-b/qinghe-privacy-debebe27.mp3":
      "female-b/agnes-privacy-debebe27.mp3",
    "female-b/ciyun-property-0d6de00a.mp3":
      "female-b/agnes-property-0d6de00a.mp3",
    "female-b/qinghe-property-0d6de00a.mp3":
      "female-b/agnes-property-0d6de00a.mp3",
    "female-b/ciyun-tribute-47330e79.mp3":
      "female-b/agnes-tribute-47330e79.mp3",
    "female-b/usa-corporate-risk-final-4e755b38.mp3":
      "female-b/japan-corporate-risk-final-4e755b38.mp3",
    "male-c/ciyun-final-3f2ef457.mp3":
      "male-c/agnes-final-3f2ef457.mp3",
    "male-c/qinghe-final-3f2ef457.mp3":
      "male-c/agnes-final-3f2ef457.mp3",
    "male-c/qinghe-normal-a901a2b3.mp3":
      "male-c/agnes-normal-a901a2b3.mp3",
    "male-c/ciyun-privacy-debebe27.mp3":
      "male-c/agnes-privacy-debebe27.mp3",
    "male-c/qinghe-privacy-debebe27.mp3":
      "male-c/agnes-privacy-debebe27.mp3",
    "male-c/ciyun-tribute-47330e79.mp3":
      "male-c/agnes-tribute-47330e79.mp3",
    "male-c/qinghe-tribute-47330e79.mp3":
      "male-c/agnes-tribute-47330e79.mp3",
    "male-c/qinghe-property-0d6de00a.mp3":
      "male-c/ciyun-property-0d6de00a.mp3",
    "male-c/usa-corporate-success-final-54162a47.mp3":
      "male-c/japan-corporate-success-final-54162a47.mp3",
  };

  LG.narrationVoiceSource = function narrationVoiceSource(voiceId, filename) {
    const key = `${voiceId}/${filename}`;
    return `./assets/voices/events/${aliases[key] || key}`;
  };
})(window.LifeGame);
