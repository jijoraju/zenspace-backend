import { Controller, Get, Route } from 'tsoa';

@Route('sample')
export class SampleController extends Controller {
    @Get('/')
    public async getSample(): Promise<string> {
        return 'Sample response';
    }
}
