import React from 'react'

class MyApp extends React.Component {
  downloadTxtFile = () => {
    const element = document.createElement('a')
    const file = new Blob(['A:123 \n B:234'], { type: 'text/plain;charset=utf-8' })
    element.href = URL.createObjectURL(file)
    element.download = 'myFile.txt'
    document.body.appendChild(element)
    element.click()
  }

  render() {
    const arr = [
      { name: 'A', content: 'Hello' },
      { name: 'B', content: 'Hi' },
    ]
    return (
      <div>
        <div id="hello">
          {arr.map((c) => (
            <div key={c.name}>
              <span>{c.name}</span>:<span>{c.content}</span>
            </div>
          ))}
        </div>
        <input id="input" />
        <button onClick={this.downloadTxtFile}>Download</button>
      </div>
    )
  }
}

export default MyApp
