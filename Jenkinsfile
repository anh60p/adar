@Library('jenkins-library') _

if (env.BRANCH_NAME == "master" || env.BRANCH_NAME == "develop") {
    buildEnvironment = ['NODE_ENV': 'test']
} else {
    buildEnvironment = [:]
}

def pipeline = new org.js.AppPipeline(steps: this,
    dockerImageName: 'polkaswap/exchange-web',
    buildDockerImage: 'docker.soramitsu.co.jp/build-tools/node:14-ubuntu-extended',
    dockerRegistryCred: 'bot-polkaswap-rw',
    buildEnvironment: buildEnvironment,
    sonarProjectName: 'polkaswap-exchange-web',
    sonarProjectKey: 'jp.co.soramitsu:polkaswap-exchange-web',
    pushToIPFS: true)
pipeline.runPipeline()
