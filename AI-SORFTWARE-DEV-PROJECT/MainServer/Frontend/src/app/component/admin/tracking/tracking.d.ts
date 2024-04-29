declare interface trackingInterface {
    trackingId:number,
    image: string,
    camera?: string,
    name?: string,
    mamberId?: string,
    gender: 'Man'|'Woman',
    age: number,
    emotion: 'Happy'|'Surprise'|'Surprise'|'Sad'|'Fear'|'Disgust'|'Angry'|'neutral',
    dateTime?: string,
    imagecaptureId?:number
}